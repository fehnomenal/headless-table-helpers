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
export {
  invertSort,
  extractSortInput,
  defaultOffsetParamNames,
  defaultCursorParamNames,
  buildSortString
};
