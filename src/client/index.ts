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

export function clientDataTable<O extends Record<string, unknown>, Column extends string>(
  ...args: ClientOffsetDataTableArgs<O, Column>
): ClientOffsetDataTable<O, Column>;

export function clientDataTable<O extends Record<string, unknown>, Column extends string>(
  ...args: ClientCursorDataTableArgs<O, Column>
): ClientCursorDataTable<O, Column>;

export function clientDataTable<O extends Record<string, unknown>, Column extends string>(
  ...args: ClientOffsetDataTableArgs<O, Column> | ClientCursorDataTableArgs<O, Column>
): ClientOffsetDataTable<O, Column> | ClientCursorDataTable<O, Column> {
  if (isOffsetArgs(args)) {
    return clientDataTableOffset(...args);
  }

  if (isCursorArgs(args)) {
    return clientDataTableCursor(...args);
  }

  assertNever(args);
}

const isOffsetArgs = <O extends Record<string, unknown>, Column extends string>(
  args: ClientOffsetDataTableArgs<O, Column> | ClientCursorDataTableArgs<O, Column>,
): args is ClientOffsetDataTableArgs<O, Column> => args[0].type === 'offset';

const isCursorArgs = <O extends Record<string, unknown>, Column extends string>(
  args: ClientOffsetDataTableArgs<O, Column> | ClientCursorDataTableArgs<O, Column>,
): args is ClientCursorDataTableArgs<O, Column> => args[0].type === 'cursor';
