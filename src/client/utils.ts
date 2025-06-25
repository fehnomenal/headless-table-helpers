import { buildSortString, invertSort, type SortInput } from '../common/sort.js';
import type { DeepAwaited } from '../loader/index.js';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { DataTableMeta } from '../server/meta-common.js';
import { apply, applyMany, isPromise } from '../utils/apply.js';
import { assertNever } from '../utils/assert-never.js';
import { calcPage, calcTotalPages } from '../utils/calculations.js';
import type { DataTableClientConfig } from './data-table-common.js';

export const mkGetParamsForSort =
  (meta: DataTableMeta<string>, existingSort: SortInput<string> | undefined, applyParams?: ParamsApplier) =>
  (field: string) => {
    const oldDirection = existingSort?.field === field ? existingSort.dir : undefined;
    const dir = oldDirection ? invertSort(oldDirection) : 'asc';

    const params = [
      [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
      [meta.paramNames.sort, buildSortString({ field, dir })],
    ] satisfies [string, string][];

    return applyParams?.(params) ?? new URLSearchParams(params);
  };

export const REMOVE_PARAM = Symbol();
export type ParamsApplier = (
  paginationParameters: [string, string | typeof REMOVE_PARAM][],
) => URLSearchParams;

export const mkParamsApplier = (
  config: Pick<DataTableClientConfig<never>, 'additionalParams'> | undefined,
): ParamsApplier => {
  const { additionalParams: params } = config ?? {};

  let _params: ConstructorParameters<typeof URLSearchParams>[0];

  const applyParams: ParamsApplier = (paginationParams) => {
    // Copy the params here so every invocation gets its own params.
    const params = new URLSearchParams(_params);

    for (const [k, v] of paginationParams) {
      if (v === REMOVE_PARAM) {
        params.delete(k);
      } else {
        params.set(k, v);
      }
    }

    return params;
  };

  if (!params) {
    // Nothing to do here.
  } else if (typeof params === 'function') {
    return (paginationParams) => params(applyParams(paginationParams));
  } else if (params instanceof URLSearchParams || Array.isArray(params)) {
    _params = params;
  } else if (params) {
    _params = Object.entries(params)
      .filter(([, value]) => !!value)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => [key, String(v)] as [string, string]);
        }

        return [[key, String(value)] as [string, string]];
      });
  } else {
    assertNever(params);
  }

  return applyParams;
};

export const normalizeRowsPerPageOptions = (meta: DataTableMeta<string>) => {
  if (!meta.rowsPerPageOptions.includes(meta.rowsPerPage)) {
    meta.rowsPerPageOptions.push(meta.rowsPerPage);
  }
  meta.rowsPerPageOptions.sort((a, b) => a - b);
};

export const getPages = <Meta extends DataTableMeta<string>>(
  meta: Meta,
  loaderResult: DataTableLoaderResult<unknown> | DeepAwaited<DataTableLoaderResult<unknown>>,
  config: DataTableClientConfig<Meta> | undefined,
) => {
  const currentPage = apply(loaderResult.currentOffset, (currentOffset) =>
    calcPage(currentOffset, meta.rowsPerPage),
  );

  const totalPages = applyMany(
    [currentPage, loaderResult.rows, loaderResult.totalRows],
    ([currentPage, rows, totalRows]) => {
      const totalPages = calcTotalPages(totalRows, meta.rowsPerPage);

      const res = config?.onTotalPages?.({ currentPage, currentPageSize: rows.length, totalPages, meta });

      if (isPromise(res)) {
        return res.then(() => totalPages);
      } else {
        return totalPages;
      }
    },
  );

  return { currentPage, totalPages };
};
