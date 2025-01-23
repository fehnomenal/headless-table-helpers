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

export { defaultOffsetParamNames, defaultCursorParamNames };
