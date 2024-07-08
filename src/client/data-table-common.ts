import { writable, type StoresValues, type Writable } from 'svelte/store';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { BaseDataTableMeta, DataTableMeta } from '../server/meta-common.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import { assertNever } from '../utils/assert-never.js';
import type { CursorDataTable } from './data-table-cursor.js';
import type { OffsetDataTable } from './data-table-offset.js';

export type DataTableClientConfig<Column extends string, Meta extends DataTableMeta<Column>> = {
  additionalParams?: Record<string, unknown>;
  onTotalPages?: (opts: {
    currentPage: number;
    currentPageSize: number;
    totalPages: number;
    meta: Meta;
  }) => void | Promise<void>;
};

export type BaseDataTable<Column extends string, O> = BaseDataTableMeta<Column> & {
  currentPage: number | 'loading';
  rows: O[];
  isLoadingRows: boolean;
  totalPages: number | 'loading';
  totalRows: number | 'loading';

  getParamsForSort(column: Column): URLSearchParams;
  paramsForFirstPage: URLSearchParams | 'loading';
  paramsForPreviousPage: URLSearchParams | 'loading';
  paramsForNextPage: URLSearchParams | 'loading';
  paramsForLastPage: URLSearchParams | null | 'loading';
};

export type ClientDataTable<Column extends string, O> =
  | OffsetDataTable<Column, O>
  | CursorDataTable<Column, O>;

export function createEmptyDataTable<Column extends string, O>(
  meta: DataTableOffsetPaginationMeta<Column>,
  getParamsForSort: (column: Column) => URLSearchParams,
): Writable<StoresValues<OffsetDataTable<Column, O>>>;

export function createEmptyDataTable<Column extends string, O>(
  meta: DataTableCursorPaginationMeta<Column>,
  getParamsForSort: (column: Column) => URLSearchParams,
): Writable<StoresValues<CursorDataTable<Column, O>>>;

export function createEmptyDataTable<Column extends string, O>(
  meta: DataTableMeta<Column>,
  getParamsForSort: (column: Column) => URLSearchParams,
): Writable<StoresValues<ClientDataTable<Column, O>>> {
  const base = {
    rowsPerPage: meta.rowsPerPage,
    rowsPerPageOptions: meta.rowsPerPageOptions,
    sortable: meta.sortable,

    currentPage: 'loading',
    totalPages: 'loading',
    totalRows: 'loading',

    rows: [],
    isLoadingRows: true,

    getParamsForSort,

    paramsForFirstPage: 'loading',
    paramsForPreviousPage: 'loading',
    paramsForNextPage: 'loading',
    paramsForLastPage: 'loading',
  } satisfies BaseDataTable<Column, O>;

  if (meta.type === 'offset') {
    return writable({
      ...base,
      paramNames: meta.paramNames,
      sort: meta.sort,
    });
  }

  if (meta.type === 'cursor') {
    return writable({
      ...base,
      paramNames: meta.paramNames,
      sort: meta.sort,
    });
  }

  return assertNever(meta);
}

export const updateDataTable = <Column extends string, O>(
  dataTable: Writable<BaseDataTable<Column, O>>,
  meta: DataTableMeta<Column>,
  getParamsForSort: (column: Column) => URLSearchParams,
  paramsForFirstPage: URLSearchParams,

  currentPage: Promise<number>,
  totalPages: Promise<number>,
  loaderResult: DataTableLoaderResult<O>,
) => {
  dataTable.update((prev) => ({
    ...prev,
    paramNames: meta.paramNames,
    rowsPerPage: meta.rowsPerPage,
    rowsPerPageOptions: meta.rowsPerPageOptions,
    sort: meta.sort,
    sortable: meta.sortable,

    isLoadingRows: true,

    getParamsForSort,

    paramsForFirstPage,
  }));

  currentPage.then((currentPage) => dataTable.update((prev) => ({ ...prev, currentPage })));
  totalPages.then((totalPages) => dataTable.update((prev) => ({ ...prev, totalPages })));
  loaderResult.totalRows.then((totalRows) => dataTable.update((prev) => ({ ...prev, totalRows })));
  loaderResult.rows.then((rows) => dataTable.update((prev) => ({ ...prev, rows, isLoadingRows: false })));
};
