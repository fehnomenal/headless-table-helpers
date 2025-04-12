import { assertNever } from '../utils/assert-never.js';
import {
  clientDataTableCursor,
  type ClientCursorDataTable,
  type ClientCursorDataTableArgs,
} from './data-table-cursor.js';
import {
  clientDataTableOffset,
  type ClientOffsetDataTable,
  type ClientOffsetDataTableArgs,
} from './data-table-offset.js';

export type { ClientDataTable, DataTableClientConfig } from './data-table-common.js';
export { clientDataTableCursor, type CursorDataTable } from './data-table-cursor.js';
export { clientDataTableOffset, type OffsetDataTable } from './data-table-offset.js';

export function clientDataTable<Column extends string, O extends Record<string, unknown>>(
  ...args: ClientOffsetDataTableArgs<Column, O>
): ClientOffsetDataTable<Column, O>;

export function clientDataTable<Column extends string, O extends Record<string, unknown>>(
  ...args: ClientCursorDataTableArgs<Column, O>
): ClientCursorDataTable<Column, O>;

export function clientDataTable<Column extends string, O extends Record<string, unknown>>(
  ...args: ClientOffsetDataTableArgs<Column, O> | ClientCursorDataTableArgs<Column, O>
): ClientOffsetDataTable<Column, O> | ClientCursorDataTable<Column, O> {
  if (isOffsetArgs(args)) {
    return clientDataTableOffset(...args);
  }

  if (isCursorArgs(args)) {
    return clientDataTableCursor(...args);
  }

  assertNever(args);
}

const isOffsetArgs = <Column extends string, O extends Record<string, unknown>>(
  args: ClientOffsetDataTableArgs<Column, O> | ClientCursorDataTableArgs<Column, O>,
): args is ClientOffsetDataTableArgs<Column, O> => args[0].type === 'offset';

const isCursorArgs = <Column extends string, O extends Record<string, unknown>>(
  args: ClientOffsetDataTableArgs<Column, O> | ClientCursorDataTableArgs<Column, O>,
): args is ClientCursorDataTableArgs<Column, O> => args[0].type === 'cursor';
