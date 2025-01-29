import {
  assertNever,
  invertSort
} from "../index-hqgvhwhc.js";

// src/kysely/loader-common.ts
var createKyselyBaseDataTableLoader = (meta, baseQuery, sortTable, executeQuery) => {
  const totalRows = getTotalRows(baseQuery);
  const base = {
    currentOffset: getCurrentOffset(meta, baseQuery, sortTable).catch(() => 0),
    rows: getRows(meta, baseQuery, sortTable, executeQuery).catch(() => []),
    totalRows: totalRows.catch(() => 0)
  };
  return base;
};
var getTotalRows = (query) => query.select((eb) => eb.fn.countAll().as("count")).executeTakeFirstOrThrow().then((r) => r.count);
var getRows = (meta, query, sortTable, executeQuery) => {
  query = query.limit(meta.rowsPerPage);
  if (meta.type === "offset") {
    query = query.offset(meta.currentOffset);
    const orderBy = meta.sort.map((sort) => `${sortTable}.${sort.field} ${sort.dir}`);
    return executeQuery(query.orderBy(orderBy), orderBy);
  }
  if (meta.type === "cursor") {
    let sortDir = meta.sort.dir;
    if (meta.direction === "before") {
      sortDir = invertSort(sortDir);
    }
    const orderBy = [`${sortTable}.${meta.sort.field} ${sortDir}`];
    if (meta.sort.field !== meta.idColumn) {
      orderBy.push(`${sortTable}.${meta.idColumn} ${sortDir}`);
    }
    query = query.$call(filter(meta, sortTable, sortDir === "desc" ? "<" : ">"));
    let returnPromise = executeQuery(query.orderBy(orderBy), orderBy);
    if (meta.direction === "before") {
      returnPromise = returnPromise.then((rows) => rows.reverse());
    }
    return returnPromise;
  }
  assertNever(meta);
};
var getCurrentOffset = async (meta, query, sortTable) => {
  if (meta.type === "offset") {
    return meta.currentOffset;
  }
  if (meta.type === "cursor") {
    if (!meta.idCursor) {
      return 0;
    }
    if (meta.sort.field !== meta.idColumn && !meta.sortCursor) {
      return 0;
    }
    query = query.$call(filter(meta, sortTable, meta.sort.dir === "desc" ? ">" : "<"));
    const offset = await query.select((eb) => eb.fn.countAll().as("count")).executeTakeFirstOrThrow().then((r) => r.count);
    if (meta.direction === "after") {
      return offset + 1;
    }
    if (meta.direction === "before") {
      return offset - meta.rowsPerPage;
    }
    assertNever(meta.direction);
  }
  assertNever(meta);
};
var filter = (meta, sortTable, sortOp) => (qb) => {
  if (meta.sort.field !== meta.idColumn) {
    if (meta.idCursor && meta.sortCursor) {
      qb = qb.where((eb) => eb.or([
        eb(`${sortTable}.${meta.sort.field}`, sortOp, meta.sortCursor),
        eb.and([
          eb(`${sortTable}.${meta.sort.field}`, "=", meta.sortCursor),
          eb(`${sortTable}.${meta.idColumn}`, sortOp, meta.idCursor)
        ])
      ]));
    }
  } else if (meta.idCursor) {
    qb = qb.where(`${sortTable}.${meta.idColumn}`, sortOp, meta.idCursor);
  }
  return qb;
};

// src/kysely/loader-cursor.ts
var createKyselyCursorDataTableLoader = (meta, baseQuery, sortTable, executeQuery) => {
  const base = createKyselyBaseDataTableLoader(meta, baseQuery, sortTable, executeQuery);
  return {
    ...base,
    lastPageCursor: getLastPageCursor(meta, base.totalRows, baseQuery, sortTable).catch(() => null)
  };
};
var getLastPageCursor = async (meta, totalRows, query, sortTable) => {
  const rows = await totalRows;
  if (rows <= meta.rowsPerPage) {
    return null;
  }
  const { sort } = meta;
  const sortDir = invertSort(sort?.dir ?? "asc");
  if (sort) {
    query = query.orderBy(`${sortTable}.${sort.field}`, sortDir);
  }
  if (sort?.field !== meta.idColumn) {
    query = query.orderBy(`${sortTable}.${meta.idColumn}`, sortDir);
  }
  let lastPageRows = rows % meta.rowsPerPage;
  if (lastPageRows === 0) {
    lastPageRows = meta.rowsPerPage;
  }
  query = query.offset(lastPageRows);
  query = query.limit(1);
  const row = await query.select(`${sortTable}.${meta.idColumn}`).$if(!!sort && sort.field !== meta.idColumn, (qb) => qb.select(`${sortTable}.${sort.field}`)).executeTakeFirst();
  if (!row) {
    return null;
  }
  return {
    id: row[meta.idColumn],
    sort: sort && row[sort.field] || undefined
  };
};

// src/kysely/loader-offset.ts
var createKyselyOffsetDataTableLoader = (meta, baseQuery, sortTable, executeQuery) => {
  return createKyselyBaseDataTableLoader(meta, baseQuery, sortTable, executeQuery);
};

// src/kysely/index.ts
function createKyselyDataTableLoader(meta, baseQuery, sortTable, executeQuery) {
  if (meta.type === "offset") {
    return createKyselyOffsetDataTableLoader(meta, baseQuery, sortTable, executeQuery);
  }
  if (meta.type === "cursor") {
    return createKyselyCursorDataTableLoader(meta, baseQuery, sortTable, executeQuery);
  }
  assertNever(meta);
}
export {
  createKyselyDataTableLoader
};
