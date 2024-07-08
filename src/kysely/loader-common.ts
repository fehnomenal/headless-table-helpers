import type { AnyColumn, SelectQueryBuilder } from 'kysely';
import { invertSort } from '../common/sort.js';
import type { BaseDataTableLoaderResult } from '../loader/result.js';
import type { DataTableMeta } from '../server/meta-common.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import { assertNever } from '../utils/assert-never.js';

export type OrderBy<DB, TB extends keyof DB & string> = `${TB}.${AnyColumn<DB, TB>} ${'asc' | 'desc'}`;

export const createKyselyBaseDataTableLoader = <DB, TB extends keyof DB & string, O>(
  meta: DataTableMeta<AnyColumn<DB, TB>>,
  baseQuery: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
): BaseDataTableLoaderResult<O> => {
  const totalRows = getTotalRows(baseQuery);

  const base = {
    currentOffset: getCurrentOffset(meta, baseQuery, sortTable).catch(() => 0),
    rows: getRows(meta, baseQuery, sortTable, executeQuery).catch(() => [] as O[]),
    totalRows: totalRows.catch(() => 0),
  } satisfies BaseDataTableLoaderResult<O>;

  return base;
};

const getTotalRows = <DB, TB extends keyof DB>(query: SelectQueryBuilder<DB, TB, Record<string, never>>) =>
  query
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow()
    .then((r) => r.count);

const getRows = <DB, TB extends keyof DB & string, O>(
  meta: DataTableMeta<AnyColumn<DB, TB>>,
  query: SelectQueryBuilder<DB, TB, {}>,
  sortTable: TB,
  executeQuery: (query: SelectQueryBuilder<DB, TB, {}>, orderBy: OrderBy<DB, TB>[]) => Promise<O[]>,
) => {
  query = query.limit(meta.rowsPerPage);

  if (meta.type === 'offset') {
    query = query.offset(meta.currentOffset);

    const orderBy = meta.sort.map((sort) => `${sortTable}.${sort.field} ${sort.dir}` as OrderBy<DB, TB>);

    return executeQuery(query.orderBy(orderBy), orderBy);
  }

  if (meta.type === 'cursor') {
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
  }

  return assertNever(meta);
};

const getCurrentOffset = async <DB, TB extends keyof DB>(
  meta: DataTableMeta<AnyColumn<DB, TB>>,
  query: SelectQueryBuilder<DB, TB, Record<string, never>>,
  sortTable: TB & string,
) => {
  if (meta.type === 'offset') {
    return meta.currentOffset;
  }

  if (meta.type === 'cursor') {
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

    return assertNever(meta.direction);
  }

  return assertNever(meta);
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
