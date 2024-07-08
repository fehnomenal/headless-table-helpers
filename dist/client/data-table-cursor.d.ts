import { type Readable } from 'svelte/store';
import type { CursorDataTableLoaderResult } from '../loader/result.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import { type BaseDataTable, type DataTableClientConfig } from './data-table-common.js';
export type ClientCursorDataTableArgs<Column extends string, O> = [
    meta: DataTableCursorPaginationMeta<Column>,
    loaderResult: CursorDataTableLoaderResult<O>,
    config?: DataTableClientConfig<Column, DataTableCursorPaginationMeta<Column>>
];
type UpdateDataTable<Column extends string, O> = (...args: ClientCursorDataTableArgs<Column, O>) => void;
export type CursorDataTable<Column extends string, O> = Readable<BaseDataTable<Column, O> & Pick<DataTableCursorPaginationMeta<Column>, 'paramNames' | 'sort'>>;
export type ClientCursorDataTable<Column extends string, O> = CursorDataTable<Column, O> & {
    update: UpdateDataTable<Column, O>;
};
export declare const clientDataTableCursor: <Column extends string, O extends Record<string, unknown>>([meta, loaderResult, config,]: ClientCursorDataTableArgs<Column, O>) => ClientCursorDataTable<Column, O>;
export {};
