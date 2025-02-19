import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import { invertSort } from '../common/sort.js';
import type { CursorDataTableLoaderResult } from '../loader/result.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import { assertNever } from '../utils/assert-never.js';
import { getTotalRows, type OrderBy } from './loader-common.js';

export const createKyselyCursorDataTableLoader = <DB, TB extends keyof DB & string, O>(
  meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>,
  baseQuery: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
): CursorDataTableLoaderResult<O> => {
  const totalRows = getTotalRows(baseQuery);

  return {
    currentOffset: getCurrentOffset(meta, baseQuery, sortTable),
    rows: getRows(meta, baseQuery, sortTable, executeQuery),
    totalRows,
    lastPageCursor: getLastPageCursor(meta, totalRows, baseQuery, sortTable).catch(() => null),
  };
};

const getCurrentOffset = async <DB, TB extends keyof DB>(
  meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>,
  query: SelectQueryBuilder<DB, TB, Record<string, never>>,
  sortTable: TB & string,
) => {
  if (!meta.idCursor) {
    // Can only happen on the first page.
    return 0;
  }

  if (meta.sort.field !== meta.idColumn && !meta.sortCursor) {
    // Fallback if something is missing.
    return 0;
  }

  query = query.$call(filter(meta, sortTable, meta.sort.dir === 'desc' ? '>' : '<'));

  const offset = await query
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow()
    .then((r) => r.count);

  if (meta.direction === 'after') {
    // Add the last row of the previous page.
    return offset + 1;
  }

  if (meta.direction === 'before') {
    // The cursor is at the end of the current page. Remove the current rows.
    return offset - meta.rowsPerPage;
  }

  assertNever(meta.direction);
};

const getRows = <DB, TB extends keyof DB & string, O>(
  meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>,
  query: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
) => {
  query = query.limit(meta.rowsPerPage);

  let sortDir = meta.sort.dir;
  if (meta.direction === 'before') {
    sortDir = invertSort(sortDir);
  }

  const orderBy: OrderBy<DB, TB>[] = [`${sortTable}.${meta.sort.field} ${sortDir}`];
  if (meta.sort.field !== meta.idColumn) {
    orderBy.push(`${sortTable}.${meta.idColumn} ${sortDir}`);
  }

  query = query.$call(filter(meta, sortTable, sortDir === 'desc' ? '<' : '>'));

  let returnPromise = executeQuery(query.orderBy(orderBy), orderBy);
  if (meta.direction === 'before') {
    // Need to reverse the wrong order.
    returnPromise = returnPromise.then((rows) => rows.reverse());
  }
  return returnPromise;
};

const filter =
  <DB, TB extends keyof DB>(
    meta: DataTableCursorPaginationMeta<AnyColumn<DB, TB>>,
    sortTable: TB & string,
    sortOp: '>' | '<',
  ) =>
  (qb: SelectQueryBuilder<DB, TB, {}>) => {
    if (meta.sort.field !== meta.idColumn) {
      if (meta.idCursor && meta.sortCursor) {
        // Compare the sort column (potentially non-unique) and the id column (to make the first selected
        // row deterministic).

        qb = qb.where((eb) =>
          eb.or([
            eb(`${sortTable}.${meta.sort.field}`, sortOp, meta.sortCursor as never),
            eb.and([
              eb(`${sortTable}.${meta.sort.field}`, '=', meta.sortCursor as never),
              eb(`${sortTable}.${meta.idColumn}`, sortOp, meta.idCursor as never),
            ]),
          ]),
        );
      }
    } else if (meta.idCursor) {
      // Only filtered by the id column. This is easy.
      qb = qb.where(`${sortTable}.${meta.idColumn}`, sortOp, meta.idCursor as never);
    }

    return qb;
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
