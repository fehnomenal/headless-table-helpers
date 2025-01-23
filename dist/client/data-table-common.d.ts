import { type Readable, type Writable } from 'svelte/store';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { BaseDataTableMeta, DataTableMeta } from '../server/meta-common.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
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
export type ClientDataTable<Column extends string, O> = OffsetDataTable<Column, O> | CursorDataTable<Column, O>;
type StoreValue<S> = S extends Readable<infer T> ? T : never;
export declare function createEmptyDataTable<Column extends string, O>(meta: DataTableOffsetPaginationMeta<Column>, getParamsForSort: (column: Column) => URLSearchParams): Writable<StoreValue<OffsetDataTable<Column, O>>>;
export declare function createEmptyDataTable<Column extends string, O>(meta: DataTableCursorPaginationMeta<Column>, getParamsForSort: (column: Column) => URLSearchParams): Writable<StoreValue<CursorDataTable<Column, O>>>;
export declare const updateDataTable: <Column extends string, O>(dataTable: Writable<BaseDataTable<Column, O>>, meta: DataTableMeta<Column>, getParamsForSort: (column: Column) => URLSearchParams, paramsForFirstPage: URLSearchParams, currentPage: Promise<number>, totalPages: Promise<number>, loaderResult: DataTableLoaderResult<O>) => void;
export {};
