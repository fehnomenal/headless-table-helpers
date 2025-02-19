import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import type {
  CursorDataTableLoaderResult,
  DataTableLoaderResult,
  OffsetDataTableLoaderResult,
} from '../loader/result.js';
import type { DataTableMeta } from '../server/meta-common.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import { assertNever } from '../utils/assert-never.js';
import type { OrderBy } from './loader-common.js';
import { createKyselyCursorDataTableLoader } from './loader-cursor.js';
import { createKyselyOffsetDataTableLoader } from './loader-offset.js';

export { createKyselyCursorDataTableLoader } from './loader-cursor.js';
export { createKyselyOffsetDataTableLoader } from './loader-offset.js';

export function createKyselyDataTableLoader<DB, TB extends keyof DB & string, O>(
  meta: DataTableOffsetPaginationMeta<AnyColumn<DB, TB>>,
  baseQuery: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
): OffsetDataTableLoaderResult<O>;

export function createKyselyDataTableLoader<DB, TB extends keyof DB & string, O>(
  meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>,
  baseQuery: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
): CursorDataTableLoaderResult<O>;

export function createKyselyDataTableLoader<DB, TB extends keyof DB & string, O>(
  meta: DataTableMeta<AnyColumn<DB, TB>>,
  baseQuery: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
): DataTableLoaderResult<O> {
  if (meta.type === 'offset') {
    return createKyselyOffsetDataTableLoader(meta, baseQuery, sortTable, executeQuery);
  }

  if (meta.type === 'cursor') {
    return createKyselyCursorDataTableLoader(meta, baseQuery, sortTable, executeQuery);
  }

  assertNever(meta);
}
