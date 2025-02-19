import type { Readable, Writable } from 'svelte/store';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { BaseDataTableMeta, DataTableMeta } from '../server/meta-common.js';
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

type StoreValue<S> = S extends Readable<infer T> ? T : never;

export const getBaseDataTableData = <Column extends string, O>(
  meta: BaseDataTableMeta<Column>,
  getParamsForSort: (column: Column) => URLSearchParams,
) =>
  ({
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
  }) satisfies BaseDataTable<Column, O>;

export type OffsetDataTableStore<Column extends string, O> = Writable<StoreValue<OffsetDataTable<Column, O>>>;
export type CursorDataTableStore<Column extends string, O> = Writable<StoreValue<CursorDataTable<Column, O>>>;

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
