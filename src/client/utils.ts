import { buildSortString, invertSort, type SortInput } from '../common/sort.js';
import type { DeepAwaited } from '../loader/index.js';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { DataTableMeta } from '../server/meta-common.js';
import { apply, applyMany, isPromise } from '../utils/apply.js';
import { calcPage, calcTotalPages } from '../utils/calculations.js';
import type { DataTableClientConfig } from './data-table-common.js';

export const mkGetParamsForSort =
  (
    meta: DataTableMeta<string>,
    existingSort: SortInput<string> | undefined,
    additionalParamsHolder: { params: [string, string][] },
  ) =>
  (field: string) => {
    const oldDirection = existingSort?.field === field ? existingSort.dir : undefined;
    const dir = oldDirection ? invertSort(oldDirection) : 'asc';

    return new URLSearchParams([
      [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
      [meta.paramNames.sort, buildSortString({ field, dir })],
      ...additionalParamsHolder.params,
    ]) as URLSearchParams;
  };

export const convertAdditionalParameters = (
  config: DataTableClientConfig<never> | undefined,
): [string, string][] =>
  Object.entries(config?.additionalParams ?? {})
    .filter(([, v]) => !!v)
    .map(([k, v]) => [k, String(v)]);

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
