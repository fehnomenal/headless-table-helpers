import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import type { CursorDataTableLoaderResult, OffsetDataTableLoaderResult } from '../loader/result.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import type { OrderBy } from './loader-common.js';
export declare function createKyselyDataTableLoader<DB, TB extends keyof DB & string, O>(meta: DataTableOffsetPaginationMeta<AnyColumn<DB, TB>>, baseQuery: SelectQueryBuilder<DB, TB, {}>, sortTable: TB, executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>): OffsetDataTableLoaderResult<O>;
export declare function createKyselyDataTableLoader<DB, TB extends keyof DB & string, O>(meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>, baseQuery: SelectQueryBuilder<DB, TB, {}>, sortTable: TB, executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>): CursorDataTableLoaderResult<O>;
