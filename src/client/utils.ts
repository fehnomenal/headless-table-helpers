import { buildSortString, invertSort, type SortInput } from '../common/sort.js';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { DataTableMeta } from '../server/meta-common.js';
import { calcPage, calcTotalPages } from '../utils/calculations.js';
import type { DataTableClientConfig } from './data-table-common.js';

export const mkGetParamsForSort =
  <Column extends string>(
    meta: DataTableMeta<Column>,
    existingSort: SortInput<Column> | undefined,
    additionalParamsHolder: { params: [string, string][] },
  ) =>
  (field: Column) => {
    const oldDirection = existingSort?.field === field ? existingSort.dir : undefined;
    const dir = oldDirection ? invertSort(oldDirection) : 'asc';

    return new URLSearchParams([
      [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
      [meta.paramNames.sort, buildSortString({ field, dir })],
      ...additionalParamsHolder.params,
    ]) as URLSearchParams;
  };

export const convertAdditionalParameters = (
  config: DataTableClientConfig<string, any> | undefined,
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

export const getPages = <Column extends string, Meta extends DataTableMeta<Column>>(
  meta: Meta,
  loaderResult: DataTableLoaderResult<unknown>,
  config: DataTableClientConfig<Column, Meta> | undefined,
) => {
  const currentPage = loaderResult.currentOffset.then((currentOffset) =>
    calcPage(currentOffset, meta.rowsPerPage),
  );

  const totalPages = Promise.all([currentPage, loaderResult.rows, loaderResult.totalRows]).then(
    async ([currentPage, rows, totalRows]) => {
      const totalPages = calcTotalPages(totalRows, meta.rowsPerPage);

      if (config?.onTotalPages) {
        await config.onTotalPages({ currentPage, currentPageSize: rows.length, totalPages, meta });
      }

      return totalPages;
    },
  );

  return { currentPage, totalPages };
};
