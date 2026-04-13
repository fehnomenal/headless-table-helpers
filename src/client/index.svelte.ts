import type { DataTableClientConfig } from './data-table-common.svelte.js';
import { ClientDataTableCursor } from './data-table-cursor.svelte.js';
import { ClientDataTableOffset } from './data-table-offset.svelte.js';

export { ClientDataTableCursor, ClientDataTableOffset };

export type ClientDataTable<O extends Record<string, unknown>> =
  | ClientDataTableCursor<O>
  | ClientDataTableOffset<O>;

export type { DataTableClientConfig };
