import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import type { BaseDataTableLoaderResult } from '../loader/result.js';
import type { DataTableMeta } from '../server/meta-common.js';
export type OrderBy<DB, TB extends keyof DB & string> = `${TB}.${AnyColumn<DB, TB>} ${'asc' | 'desc'}`;
export declare const createKyselyBaseDataTableLoader: <DB, TB extends keyof DB & string, O>(meta: DataTableMeta<AnyColumn<DB, TB>>, baseQuery: SelectQueryBuilder<DB, TB, {}>, sortTable: TB, executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>) => BaseDataTableLoaderResult<O>;
