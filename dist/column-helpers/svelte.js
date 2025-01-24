// src/column-helpers/svelte.ts
var createDataTableHelper = (_dataTable) => ({
  accessor: (column, config) => ({
    type: "accessor",
    column,
    ...config
  }),
  group: (columns, config) => ({
    type: "group",
    columns,
    ...config
  }),
  static: (config) => ({
    type: "static",
    ...config
  })
});
export {
  createDataTableHelper
};
