// src/column-helpers/svelte.ts
var createDataTableHelper = (_dataTable) => ({
  accessor: createAccessorHelper(),
  group: createGroupHelper(),
  static: createStaticHelper()
});
function createAccessorHelper() {
  function accessorHelper(columnOrFn, config) {
    const value = typeof columnOrFn === "string" ? (row) => row[columnOrFn] : columnOrFn;
    return {
      type: "accessor",
      column: typeof columnOrFn === "string" ? columnOrFn : undefined,
      value,
      ...config
    };
  }
  return accessorHelper;
}
function createGroupHelper() {
  return function groupHelper(columns, config) {
    return {
      type: "accessor",
      columns,
      values: (row) => Object.fromEntries(columns.map((col) => [col, row[col]])),
      ...config
    };
  };
}
function createStaticHelper() {
  return function staticHelper(config) {
    return {
      type: "static",
      ...config
    };
  };
}
export {
  createDataTableHelper
};
