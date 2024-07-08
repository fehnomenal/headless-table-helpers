import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import type { OffsetDataTableLoaderResult } from '../loader/result.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import { type OrderBy } from './loader-common.js';
export declare const createKyselyOffsetDataTableLoader: <DB, TB extends keyof DB & string, O>(meta: DataTableOffsetPaginationMeta<AnyColumn<DB, TB>>, baseQuery: SelectQueryBuilder<DB, TB, {}>, sortTable: TB, executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>) => OffsetDataTableLoaderResult<O>;
