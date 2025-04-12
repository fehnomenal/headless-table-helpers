import type { Readable, Writable } from 'svelte/store';
import type { DeepAwaited } from '../loader/index.js';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { BaseDataTableMeta, DataTableMeta } from '../server/meta-common.js';
import { apply, isPromise } from '../utils/apply.js';
import type { CursorDataTable } from './data-table-cursor.js';
import type { OffsetDataTable } from './data-table-offset.js';

export type DataTableClientConfig<Meta extends DataTableMeta<string>> = {
  additionalParams?: Record<string, unknown>;
  onTotalPages?: (opts: {
    currentPage: number;
    currentPageSize: number;
    totalPages: number;
    meta: Meta;
  }) => void | Promise<void>;
};

export type BaseDataTable<O, Column extends string> = BaseDataTableMeta<Column> & {
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

export type ClientDataTable<O, Column extends string> =
  | OffsetDataTable<O, Column>
  | CursorDataTable<O, Column>;

type StoreValue<S> = S extends Readable<infer T> ? T : never;

export const getBaseDataTableData = <O, Column extends string>(
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
  }) satisfies BaseDataTable<O, Column>;

export type OffsetDataTableStore<O, Column extends string> = Writable<StoreValue<OffsetDataTable<O, Column>>>;
export type CursorDataTableStore<O, Column extends string> = Writable<StoreValue<CursorDataTable<O, Column>>>;

export const updateDataTable = <O, Column extends string>(
  dataTable: Writable<BaseDataTable<O, Column>>,
  meta: DataTableMeta<Column>,
  getParamsForSort: (column: Column) => URLSearchParams,
  paramsForFirstPage: URLSearchParams,

  currentPage: number | PromiseLike<number>,
  totalPages: number | PromiseLike<number>,
  loaderResult: DataTableLoaderResult<O> | DeepAwaited<DataTableLoaderResult<O>>,
) => {
  dataTable.update((prev) => ({
    ...prev,
    paramNames: meta.paramNames,
    rowsPerPage: meta.rowsPerPage,
    rowsPerPageOptions: meta.rowsPerPageOptions,
    sort: meta.sort,
    sortable: meta.sortable,

    isLoadingRows: isPromise(loaderResult.rows),

    getParamsForSort,

    paramsForFirstPage,
  }));

  apply(currentPage, (currentPage) => dataTable.update((prev) => ({ ...prev, currentPage })));
  apply(totalPages, (totalPages) => dataTable.update((prev) => ({ ...prev, totalPages })));
  apply(loaderResult.totalRows, (totalRows) => dataTable.update((prev) => ({ ...prev, totalRows })));
  apply(loaderResult.rows, (rows) => dataTable.update((prev) => ({ ...prev, rows, isLoadingRows: false })));
};
