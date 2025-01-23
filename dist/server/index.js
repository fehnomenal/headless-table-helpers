import {
  defaultCursorParamNames,
  defaultOffsetParamNames
} from "../index-r4qjp376.js";
import {
  extractSortInput
} from "../index-hqgvhwhc.js";

// src/server/constants.ts
var DEFAULT_ROWS_PER_PAGE = 10;
var MAX_ROWS_PER_PAGE = 1000;
var DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// src/server/meta-common.ts
var extractParamsFromInput = (input) => input instanceof URLSearchParams ? input : input instanceof URL ? input.searchParams : input.url.searchParams;
var getBaseDataTableMeta = (params, paramNames, config) => {
  const rowsPerPageOptions = config?.rowsPerPageOptions ?? DEFAULT_ROWS_PER_PAGE_OPTIONS;
  const rowsPerPage = Math.min(getIntParam(params.get(paramNames.rowsPerPage), config?.defaultRowsPerPage ?? rowsPerPageOptions[0] ?? DEFAULT_ROWS_PER_PAGE), MAX_ROWS_PER_PAGE);
  return {
    rowsPerPage,
    rowsPerPageOptions,
    sortable: config?.sortable ?? []
  };
};
var getIntParam = (paramValue, defaultValue) => {
  if (paramValue) {
    const val = parseInt(paramValue, 10);
    if (!isNaN(val)) {
      return val;
    }
  }
  return defaultValue;
};
function getSort(sortInput, config) {
  if (!config?.sortable || config.sortable.length === 0) {
    return;
  }
  const { sortable } = config;
  const isColumnSortable = ({ field }) => sortable.includes(field);
  const sortArray = Array.isArray(sortInput) ? sortInput : sortInput ? [sortInput] : [];
  const sort = [];
  for (const str of sortArray) {
    const input = extractSortInput(str, isColumnSortable);
    if (input) {
      sort.push(input);
    }
  }
  if (sort.length === 0) {
    return;
  }
  return Array.isArray(sortInput) ? sort : sort[0] ?? null;
}

// src/server/meta-cursor.ts
function getDataTableCursorPaginationMeta(input, config) {
  const params = extractParamsFromInput(input);
  const paramNames = { ...defaultCursorParamNames, ...config.paramNames };
  const meta = getBaseDataTableMeta(params, paramNames, config);
  const idCursor = params.get(paramNames.cursorId) ?? undefined;
  const sort = getSort(params.get(paramNames.sort), config) ?? { field: config.idColumn, dir: "asc" };
  const sortCursor = params.get(paramNames.cursorSort) ?? undefined;
  const direction = params.get(paramNames.direction);
  return {
    type: "cursor",
    ...meta,
    paramNames,
    idColumn: config.idColumn,
    idCursor,
    sort,
    sortCursor,
    direction: direction === "before" ? direction : "after"
  };
}
// src/server/meta-offset.ts
function getDataTableOffsetPaginationMeta(input, config) {
  const params = extractParamsFromInput(input);
  const paramNames = { ...defaultOffsetParamNames, ...config?.paramNames };
  const meta = getBaseDataTableMeta(params, paramNames, config);
  const currentOffset = Math.max(getIntParam(params.get(paramNames.currentOffset), 0), 0);
  const sort = getSort(params.getAll(paramNames.sort), config) ?? config?.defaultSort ?? [];
  return {
    type: "offset",
    ...meta,
    paramNames,
    currentOffset,
    sort
  };
}
export {
  getDataTableOffsetPaginationMeta,
  getDataTableCursorPaginationMeta
};
