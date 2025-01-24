import {
  assertNever,
  buildSortString,
  invertSort
} from "../index-hqgvhwhc.js";

// src/client/data-table-cursor.ts
import { readonly } from "svelte/store";

// src/client/data-table-common.ts
import { writable } from "svelte/store";
function createEmptyDataTable(meta, getParamsForSort) {
  const base = {
    rowsPerPage: meta.rowsPerPage,
    rowsPerPageOptions: meta.rowsPerPageOptions,
    sortable: meta.sortable,
    currentPage: "loading",
    totalPages: "loading",
    totalRows: "loading",
    rows: [],
    isLoadingRows: true,
    getParamsForSort,
    paramsForFirstPage: "loading",
    paramsForPreviousPage: "loading",
    paramsForNextPage: "loading",
    paramsForLastPage: "loading"
  };
  if (meta.type === "offset") {
    return writable({
      ...base,
      paramNames: meta.paramNames,
      sort: meta.sort
    });
  }
  if (meta.type === "cursor") {
    return writable({
      ...base,
      paramNames: meta.paramNames,
      sort: meta.sort
    });
  }
  assertNever(meta);
}
var updateDataTable = (dataTable, meta, getParamsForSort, paramsForFirstPage, currentPage, totalPages, loaderResult) => {
  dataTable.update((prev) => ({
    ...prev,
    paramNames: meta.paramNames,
    rowsPerPage: meta.rowsPerPage,
    rowsPerPageOptions: meta.rowsPerPageOptions,
    sort: meta.sort,
    sortable: meta.sortable,
    isLoadingRows: true,
    getParamsForSort,
    paramsForFirstPage
  }));
  currentPage.then((currentPage2) => dataTable.update((prev) => ({ ...prev, currentPage: currentPage2 })));
  totalPages.then((totalPages2) => dataTable.update((prev) => ({ ...prev, totalPages: totalPages2 })));
  loaderResult.totalRows.then((totalRows) => dataTable.update((prev) => ({ ...prev, totalRows })));
  loaderResult.rows.then((rows) => dataTable.update((prev) => ({ ...prev, rows, isLoadingRows: false })));
};

// src/utils/calculations.ts
var calcPage = (offset, perPage) => Math.floor(offset / perPage) + 1;
var calcTotalPages = (totalRows, perPage) => Math.ceil(totalRows / perPage);
var calcOffset = (page, perPage) => (page - 1) * perPage;

// src/client/utils.ts
var mkGetParamsForSort = (meta, existingSort, additionalParamsHolder) => (field) => {
  const oldDirection = existingSort?.field === field ? existingSort.dir : undefined;
  const dir = oldDirection ? invertSort(oldDirection) : "asc";
  return new URLSearchParams([
    [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
    [meta.paramNames.sort, buildSortString({ field, dir })],
    ...additionalParamsHolder.params
  ]);
};
var convertAdditionalParameters = (config) => Object.entries(config?.additionalParams ?? {}).filter(([, v]) => !!v).map(([k, v]) => [k, String(v)]);
var normalizeRowsPerPageOptions = (meta) => {
  if (!meta.rowsPerPageOptions.includes(meta.rowsPerPage)) {
    meta.rowsPerPageOptions.push(meta.rowsPerPage);
  }
  meta.rowsPerPageOptions.sort((a, b) => a - b);
};
var getPages = (meta, loaderResult, config) => {
  const currentPage = loaderResult.currentOffset.then((currentOffset) => calcPage(currentOffset, meta.rowsPerPage));
  const totalPages = Promise.all([currentPage, loaderResult.rows, loaderResult.totalRows]).then(async ([currentPage2, rows, totalRows]) => {
    const totalPages2 = calcTotalPages(totalRows, meta.rowsPerPage);
    if (config?.onTotalPages) {
      await config.onTotalPages({ currentPage: currentPage2, currentPageSize: rows.length, totalPages: totalPages2, meta });
    }
    return totalPages2;
  });
  return { currentPage, totalPages };
};

// src/client/data-table-cursor.ts
var clientDataTableCursor = ([
  meta,
  loaderResult,
  config
]) => {
  const additionalParamsHolder = { params: [] };
  const dataTable = createEmptyDataTable(meta, mkGetParamsForSort(meta, meta.sort, additionalParamsHolder));
  const update = (meta2, loaderResult2, config2) => {
    additionalParamsHolder.params = convertAdditionalParameters(config2);
    normalizeRowsPerPageOptions(meta2);
    const { currentPage, totalPages } = getPages(meta2, loaderResult2, config2);
    updateDataTable(dataTable, meta2, mkGetParamsForSort(meta2, meta2.sort, additionalParamsHolder), getParamsForPagination(meta2, additionalParamsHolder, null, null), currentPage, totalPages, loaderResult2);
    loaderResult2.rows.then((rows) => dataTable.update((prev) => ({
      ...prev,
      paramsForPreviousPage: getParamsForPagination(meta2, additionalParamsHolder, getCursor(rows[0], meta2), "before"),
      paramsForNextPage: getParamsForPagination(meta2, additionalParamsHolder, getCursor(rows[rows.length - 1], meta2), "after")
    })));
    loaderResult2.lastPageCursor.then((cursor) => dataTable.update((prev) => ({
      ...prev,
      paramsForLastPage: cursor === null ? null : getParamsForPagination(meta2, additionalParamsHolder, cursor, "after")
    })));
  };
  update(meta, loaderResult, config);
  return { ...readonly(dataTable), update };
};
var getParamsForPagination = (meta, additionalParamsHolder, cursor, direction) => {
  const params = new URLSearchParams([
    [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
    ...additionalParamsHolder.params
  ]);
  if (cursor) {
    params.set(meta.paramNames.cursorId, `${cursor.id}`);
  }
  if (meta.sort.field !== meta.idColumn) {
    params.set(meta.paramNames.sort, buildSortString(meta.sort));
    if (cursor) {
      params.set(meta.paramNames.cursorSort, `${cursor.sort}`);
    }
  }
  if (direction) {
    params.set(meta.paramNames.direction, direction);
  }
  return params;
};
var getCursor = (row, meta) => ({
  id: row?.[meta.idColumn],
  sort: row?.[meta.sort.field]
});

// src/client/data-table-offset.ts
import { readonly as readonly2 } from "svelte/store";
var clientDataTableOffset = ([
  meta,
  loaderResult,
  config
]) => {
  const additionalParamsHolder = { params: [] };
  const dataTable = createEmptyDataTable(meta, mkGetParamsForSort(meta, meta.sort[0], additionalParamsHolder));
  const update = (meta2, loaderResult2, config2) => {
    additionalParamsHolder.params = convertAdditionalParameters(config2);
    normalizeRowsPerPageOptions(meta2);
    const { currentPage, totalPages } = getPages(meta2, loaderResult2, config2);
    updateDataTable(dataTable, meta2, mkGetParamsForSort(meta2, meta2.sort[0], additionalParamsHolder), getParamsForPagination2(meta2, additionalParamsHolder, 1), currentPage, totalPages, loaderResult2);
    currentPage.then((currentPage2) => dataTable.update((prev) => ({
      ...prev,
      paramsForPreviousPage: getParamsForPagination2(meta2, additionalParamsHolder, currentPage2 - 1),
      paramsForNextPage: getParamsForPagination2(meta2, additionalParamsHolder, currentPage2 + 1)
    })));
    totalPages.then((totalPages2) => dataTable.update((prev) => ({
      ...prev,
      paramsForLastPage: getParamsForPagination2(meta2, additionalParamsHolder, totalPages2)
    })));
    return readonly2(dataTable);
  };
  update(meta, loaderResult, config);
  return { ...readonly2(dataTable), update };
};
var getParamsForPagination2 = (meta, additionalParamsHolder, page) => {
  const params = new URLSearchParams([
    [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
    ...additionalParamsHolder.params
  ]);
  if (page > 1) {
    params.set(meta.paramNames.currentOffset, calcOffset(page, meta.rowsPerPage).toString());
  }
  for (const sort of meta.sort) {
    params.append(meta.paramNames.sort, buildSortString(sort));
  }
  return params;
};

// src/client/index.ts
function clientDataTable(...args) {
  if (isOffsetArgs(args)) {
    return clientDataTableOffset(args);
  }
  if (isCursorArgs(args)) {
    return clientDataTableCursor(args);
  }
  assertNever(args);
}
var isOffsetArgs = (args) => args[0].type === "offset";
var isCursorArgs = (args) => args[0].type === "cursor";
export {
  clientDataTable
};
