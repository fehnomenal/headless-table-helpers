// src/common/params.ts
var defaultBaseParamNames = {
  rowsPerPage: "per_page",
  sort: "sort"
};
var defaultOffsetParamNames = {
  currentOffset: "offset",
  ...defaultBaseParamNames
};
var defaultCursorParamNames = {
  cursorId: "id_c",
  cursorSort: "sort_c",
  direction: "dir",
  ...defaultBaseParamNames
};

// src/utils/assert-never.ts
var assertNever = (x) => {
  throw new Error(`This should never happen! Expected never, got ${JSON.stringify(x)}.`);
};

// src/common/sort.ts
function invertSort(dir) {
  if (dir === "asc") {
    return "desc";
  }
  if (dir === "desc") {
    return "asc";
  }
  return assertNever(dir);
}
var extractSortInput = (str, validate) => {
  const input = getSortInput(str);
  return input && validate(input) ? input : null;
};
var getSortInput = (str) => {
  if (str.endsWith(":asc")) {
    return {
      field: str.slice(0, -":asc".length),
      dir: "asc"
    };
  } else if (str.endsWith(":desc")) {
    return {
      field: str.slice(0, -":desc".length),
      dir: "desc"
    };
  }
  return null;
};
var buildSortString = ({ field, dir }) => `${field}:${dir}`;

// src/server/constants.ts
var DEFAULT_ROWS_PER_PAGE = 10;
var MAX_ROWS_PER_PAGE = 1000;
var DEFAULT_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

// src/server/meta-common.ts
function getSort(sortInput, config) {
  if (!config?.sortable || config.sortable.length === 0) {
    return;
  }
  const { sortable } = config;
  const isColumnSortable = ({ field }) => sortable.includes(field);
  const sortArray = Array.isArray(sortInput) ? sortInput : sortInput ? [sortInput] : [];
  const sort2 = [];
  for (const str of sortArray) {
    const input = extractSortInput(str, isColumnSortable);
    if (input) {
      sort2.push(input);
    }
  }
  if (sort2.length === 0) {
    return;
  }
  return Array.isArray(sortInput) ? sort2 : sort2[0] ?? null;
}
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

// src/server/meta-cursor.ts
function getDataTableCursorPaginationMeta(input, config) {
  const params2 = extractParamsFromInput(input);
  const paramNames = { ...defaultCursorParamNames, ...config.paramNames };
  const meta = getBaseDataTableMeta(params2, paramNames, config);
  const idCursor = params2.get(paramNames.cursorId) ?? undefined;
  const sort2 = getSort(params2.get(paramNames.sort), config) ?? { field: config.idColumn, dir: "asc" };
  const sortCursor = params2.get(paramNames.cursorSort) ?? undefined;
  const direction = params2.get(paramNames.direction);
  return {
    type: "cursor",
    ...meta,
    paramNames,
    idColumn: config.idColumn,
    idCursor,
    sort: sort2,
    sortCursor,
    direction: direction === "before" ? direction : "after"
  };
}
// src/server/meta-offset.ts
function getDataTableOffsetPaginationMeta(input, config) {
  const params3 = extractParamsFromInput(input);
  const paramNames = { ...defaultOffsetParamNames, ...config?.paramNames };
  const meta = getBaseDataTableMeta(params3, paramNames, config);
  const currentOffset = Math.max(getIntParam(params3.get(paramNames.currentOffset), 0), 0);
  const sort2 = getSort(params3.getAll(paramNames.sort), config) ?? config?.defaultSort ?? [];
  return {
    type: "offset",
    ...meta,
    paramNames,
    currentOffset,
    sort: sort2
  };
}
export {
  getDataTableOffsetPaginationMeta,
  getDataTableCursorPaginationMeta
};
