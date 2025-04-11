import { readonly, writable, type Readable } from 'svelte/store';
import { buildSortString } from '../common/sort.js';
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
import type { DeepAwaited } from '../loader/index.js';

export type ClientOffsetDataTableArgs<Column extends string, O> = [
  meta: DataTableOffsetPaginationMeta<Column>,
  loaderResult: OffsetDataTableLoaderResult<O> | DeepAwaited<OffsetDataTableLoaderResult<O>>,
  config?: DataTableClientConfig<Column, DataTableOffsetPaginationMeta<Column>>,
];

type UpdateDataTable<Column extends string, O> = (...args: ClientOffsetDataTableArgs<Column, O>) => void;

export type OffsetDataTable<Column extends string, O> = Readable<
  BaseDataTable<Column, O> & Pick<DataTableOffsetPaginationMeta<Column>, 'paramNames' | 'sort'>
>;

export type ClientOffsetDataTable<Column extends string, O> = OffsetDataTable<Column, O> & {
  update: UpdateDataTable<Column, O>;
};

export const clientDataTableOffset = <Column extends string, O extends Record<string, unknown>>([
  meta,
  loaderResult,
  config,
]: ClientOffsetDataTableArgs<Column, O>): ClientOffsetDataTable<Column, O> => {
  const additionalParamsHolder: { params: [string, string][] } = { params: [] };

  const dataTable: OffsetDataTableStore<Column, O> = writable({
    ...getBaseDataTableData(meta, mkGetParamsForSort(meta, meta.sort[0], additionalParamsHolder)),
    paramNames: meta.paramNames,
    sort: meta.sort,
  });

  const update: UpdateDataTable<Column, O> = (meta, loaderResult, config) => {
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

const getParamsForPagination = <Column extends string>(
  meta: DataTableOffsetPaginationMeta<Column>,
  additionalParamsHolder: { params: [string, string][] },
  page: number,
) => {
  const params = new URLSearchParams([
    [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
    ...additionalParamsHolder.params,
  ]);

  if (page > 1) {
    params.set(meta.paramNames.currentOffset, calcOffset(page, meta.rowsPerPage).toString());
  }

  for (const sort of meta.sort) {
    params.append(meta.paramNames.sort, buildSortString(sort));
  }

  return params as URLSearchParams;
};
