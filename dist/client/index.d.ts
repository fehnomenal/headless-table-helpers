import { type ClientCursorDataTable, type ClientCursorDataTableArgs } from './data-table-cursor.js';
import { type ClientOffsetDataTable, type ClientOffsetDataTableArgs } from './data-table-offset.js';
export type { ClientDataTable, DataTableClientConfig } from './data-table-common.js';
export type { CursorDataTable } from './data-table-cursor.js';
export type { OffsetDataTable } from './data-table-offset.js';
export declare function clientDataTable<Column extends string, O extends Record<string, unknown>>(...args: ClientOffsetDataTableArgs<Column, O>): ClientOffsetDataTable<Column, O>;
export declare function clientDataTable<Column extends string, O extends Record<string, unknown>>(...args: ClientCursorDataTableArgs<Column, O>): ClientCursorDataTable<Column, O>;
