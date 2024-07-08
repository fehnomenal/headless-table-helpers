export type Input = { url: URL } | URL | URLSearchParams;

export type DataTableConfig<Column extends string> = {
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  sortable?: Column[];
};
