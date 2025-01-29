import { type Readable } from 'svelte/store';
import type { OffsetDataTableLoaderResult } from '../loader/result.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import { type BaseDataTable, type DataTableClientConfig } from './data-table-common.js';
export type ClientOffsetDataTableArgs<Column extends string, O> = [
    meta: DataTableOffsetPaginationMeta<Column>,
    loaderResult: OffsetDataTableLoaderResult<O>,
    config?: DataTableClientConfig<Column, DataTableOffsetPaginationMeta<Column>>
];
type UpdateDataTable<Column extends string, O> = (...args: ClientOffsetDataTableArgs<Column, O>) => void;
export type OffsetDataTable<Column extends string, O> = Readable<BaseDataTable<Column, O> & Pick<DataTableOffsetPaginationMeta<Column>, 'paramNames' | 'sort'>>;
export type ClientOffsetDataTable<Column extends string, O> = OffsetDataTable<Column, O> & {
    update: UpdateDataTable<Column, O>;
};
export declare const clientDataTableOffset: <Column extends string, O extends Record<string, unknown>>([meta, loaderResult, config,]: ClientOffsetDataTableArgs<Column, O>) => ClientOffsetDataTable<Column, O>;
export {};
