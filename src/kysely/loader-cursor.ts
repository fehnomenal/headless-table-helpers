import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import { invertSort } from '../common/sort.js';
import type { CursorDataTableLoaderResult } from '../loader/result.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import { createKyselyBaseDataTableLoader, type OrderBy } from './loader-common.js';

export const createKyselyCursorDataTableLoader = <DB, TB extends keyof DB & string, O>(
  meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>,
  baseQuery: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
): CursorDataTableLoaderResult<O> => {
  const base = createKyselyBaseDataTableLoader(meta, baseQuery, sortTable, executeQuery);

  return {
    ...base,
    lastPageCursor: getLastPageCursor(meta, base.totalRows, baseQuery, sortTable).catch(() => null),
  };
};

const getLastPageCursor = async <DB, TB extends keyof DB & string>(
  meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>,
  totalRows: Promise<number>,
  query: SelectQueryBuilder<DB, TB, Record<string, never>>,
  sortTable: TB,
) => {
  const rows = await totalRows;

  if (rows <= meta.rowsPerPage) {
    return null;
  }

  // Sort the rows reverse of the display direction.
  const { sort } = meta;
  const sortDir = invertSort(sort?.dir ?? 'asc');

  if (sort) {
    query = query.orderBy(`${sortTable}.${sort.field}`, sortDir);
  }

  if (sort?.field !== meta.idColumn) {
    // MsSql does not like duplicated order by columns...
    query = query.orderBy(`${sortTable}.${meta.idColumn}`, sortDir);
  }

  // Skip the number of rows on the last page.
  let lastPageRows = rows % meta.rowsPerPage;
  if (lastPageRows === 0) {
    // We need to skip the whole last page.
    lastPageRows = meta.rowsPerPage;
  }
  query = query.offset(lastPageRows);

  // And take the first row only.
  query = query.limit(1);

  // Select the relevant columns.
  const row = await query
    .select(`${sortTable}.${meta.idColumn}`)
    .$if(!!sort && sort.field !== meta.idColumn, (qb) => qb.select(`${sortTable}.${sort!.field}`))
    .executeTakeFirst();

  if (!row) {
    return null;
  }

  return {
    id: row[meta.idColumn],
    sort: (sort && row[sort.field]) || undefined,
  };
};
