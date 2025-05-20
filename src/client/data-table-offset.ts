import { readonly, writable, type Readable } from 'svelte/store';
import { buildSortString } from '../common/sort.js';
import type { DeepAwaited } from '../loader/index.js';
import type { OffsetDataTableLoaderResult } from '../loader/result.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import { apply } from '../utils/apply.js';
import { calcOffset } from '../utils/calculations.js';
import {
  getBaseDataTableData,
  updateDataTable,
  type BaseDataTable,
  type DataTableClientConfig,
  type OffsetDataTableStore,
} from './data-table-common.js';
import {
  convertAdditionalParameters,
  getPages,
  mkGetParamsForSort,
  normalizeRowsPerPageOptions,
} from './utils.js';

export type ClientOffsetDataTableArgs<O, Column extends string> = [
  meta: DataTableOffsetPaginationMeta<Column>,
  loaderResult: OffsetDataTableLoaderResult<O> | DeepAwaited<OffsetDataTableLoaderResult<O>>,
  config?: DataTableClientConfig<DataTableOffsetPaginationMeta<Column>>,
];

type UpdateDataTable<O, Column extends string> = (...args: ClientOffsetDataTableArgs<O, Column>) => void;

export type OffsetDataTable<O, Column extends string> = Readable<
  BaseDataTable<O, Column> & Pick<DataTableOffsetPaginationMeta<Column>, 'paramNames' | 'sort'>
>;

export type ClientOffsetDataTable<O, Column extends string> = OffsetDataTable<O, Column> & {
  update: UpdateDataTable<O, Column>;
};

export const clientDataTableOffset = <O extends Record<string, unknown>, Column extends string>(
  ...[meta, loaderResult, config]: ClientOffsetDataTableArgs<O, Column>
): ClientOffsetDataTable<O, Column> => {
  const additionalParamsHolder: { params: [string, string][] } = { params: [] };

  const dataTable: OffsetDataTableStore<O, Column> = writable({
    ...getBaseDataTableData(meta, mkGetParamsForSort(meta, meta.sort[0], additionalParamsHolder)),
    paramNames: meta.paramNames,
    sort: meta.sort,
  });

  const update: UpdateDataTable<O, Column> = (meta, loaderResult, config) => {
    additionalParamsHolder.params = convertAdditionalParameters(config);
    normalizeRowsPerPageOptions(meta);

    const { currentPage, totalPages } = getPages(meta, loaderResult, config);

    updateDataTable(
      dataTable,
      meta,
      mkGetParamsForSort(meta, meta.sort[0], additionalParamsHolder),
      getParamsForPagination(meta, additionalParamsHolder, 1),
      currentPage,
      totalPages,
      loaderResult,
    );

    apply(currentPage, (currentPage) =>
      dataTable.update((prev) => ({
        ...prev,
        paramsForPreviousPage: getParamsForPagination(meta, additionalParamsHolder, currentPage - 1),
        paramsForNextPage: getParamsForPagination(meta, additionalParamsHolder, currentPage + 1),
      })),
    );

    apply(totalPages, (totalPages) =>
      dataTable.update((prev) => ({
        ...prev,
        paramsForLastPage: getParamsForPagination(meta, additionalParamsHolder, totalPages),
      })),
    );

    return readonly(dataTable);
  };

  update(meta, loaderResult, config);

  return { ...readonly(dataTable), update };
};

const getParamsForPagination = (
  meta: DataTableOffsetPaginationMeta<string>,
  additionalParamsHolder: { params: [string, string][] },
  page: number,
) => {
  const params = new URLSearchParams([
    ...additionalParamsHolder.params,
    [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
  ]);

  if (page > 1) {
    params.set(meta.paramNames.currentOffset, calcOffset(page, meta.rowsPerPage).toString());
  }

  for (const sort of meta.sort) {
    params.append(meta.paramNames.sort, buildSortString(sort));
  }

  return params as URLSearchParams;
};
