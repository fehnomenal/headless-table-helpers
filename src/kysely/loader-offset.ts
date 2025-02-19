import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import type { OffsetDataTableLoaderResult } from '../loader/result.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import { getTotalRows, type OrderBy } from './loader-common.js';

export const createKyselyOffsetDataTableLoader = <DB, TB extends keyof DB & string, O>(
  meta: DataTableOffsetPaginationMeta<AnyColumn<DB, TB>>,
  baseQuery: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
): OffsetDataTableLoaderResult<O> => {
  const totalRows = getTotalRows(baseQuery);

  return {
    currentOffset: Promise.resolve(meta.currentOffset),
    rows: getRows(meta, baseQuery, sortTable, executeQuery),
    totalRows,
  };
};

const getRows = <DB, TB extends keyof DB & string, O>(
  meta: DataTableOffsetPaginationMeta<AnyColumn<DB, TB>>,
  query: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
) => {
  const orderBy = meta.sort.map((sort) => `${sortTable}.${sort.field} ${sort.dir}` as OrderBy<DB, TB>);

  return executeQuery(query.orderBy(orderBy).offset(meta.currentOffset).limit(meta.rowsPerPage), orderBy);
};
