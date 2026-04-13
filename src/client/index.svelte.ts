import { ClientDataTableCursor } from './data-table-cursor.svelte.js';
import { ClientDataTableOffset } from './data-table-offset.svelte.js';

export { ClientDataTableCursor, ClientDataTableOffset };

export type ClientDataTable<O extends Record<string, unknown>, Column extends string> =
  | ClientDataTableCursor<O, Column>
  | ClientDataTableOffset<O, Column>;
