import type { CursorParamNames, OffsetParamNames } from '../common/params.js';
import { extractSortInput, type SortInput } from '../common/sort.js';
import { DEFAULT_ROWS_PER_PAGE, DEFAULT_ROWS_PER_PAGE_OPTIONS, MAX_ROWS_PER_PAGE } from './constants.js';
import type { DataTableCursorPaginationMeta } from './meta-cursor.js';
import type { DataTableOffsetPaginationMeta } from './meta-offset.js';
import type { DataTableConfig, Input } from './types.js';

export type DataTableMeta<Column extends string> =
  | DataTableOffsetPaginationMeta<Column>
  | DataTableCursorPaginationMeta<Column>;

export type BaseDataTableMeta<Column extends string> = {
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  sortable: Column[];
};

export const extractParamsFromInput = (input: Input): URLSearchParams =>
  input instanceof URLSearchParams
    ? input
    : input instanceof URL
      ? (input.searchParams as URLSearchParams)
      : (input.url.searchParams as URLSearchParams);

export const getBaseDataTableMeta = <
  Column extends string,
  ParamNames extends Required<OffsetParamNames> | Required<CursorParamNames>,
>(
  params: URLSearchParams,
  paramNames: Required<ParamNames>,
  config: DataTableConfig<Column> | undefined,
): BaseDataTableMeta<Column> => {
  const rowsPerPageOptions = config?.rowsPerPageOptions ?? [...DEFAULT_ROWS_PER_PAGE_OPTIONS];

  const rowsPerPage = Math.min(
    getIntParam(
      params.get(paramNames.rowsPerPage),
      config?.defaultRowsPerPage ?? Math.min(...rowsPerPageOptions) ?? DEFAULT_ROWS_PER_PAGE,
    ),
    MAX_ROWS_PER_PAGE,
  );

  return {
    rowsPerPage,
    rowsPerPageOptions,
    sortable: config?.sortable ?? [],
  };
};

export const getIntParam = (paramValue: string | null, defaultValue: number) => {
  if (paramValue) {
    const val = parseInt(paramValue, 10);
    if (!isNaN(val)) {
      return val;
    }
  }

  return defaultValue;
};

export function getSort<Column extends string>(
  sortStrings: string[],
  config: DataTableConfig<Column> | undefined,
): SortInput<Column>[] | undefined;

export function getSort<Column extends string>(
  sortString: string | null,
  config: DataTableConfig<Column> | undefined,
): SortInput<Column> | undefined;

export function getSort<Column extends string>(
  sortInput: string | string[] | null,
  config: DataTableConfig<Column> | undefined,
) {
  if (!config?.sortable || config.sortable.length === 0) {
    return undefined;
  }

  const { sortable } = config;
  const isColumnSortable = ({ field }: SortInput<Column>) => sortable.includes(field);

  const sortArray = Array.isArray(sortInput) ? sortInput : sortInput ? [sortInput] : [];
  const sort: SortInput<Column>[] = [];

  for (const str of sortArray) {
    const input = extractSortInput(str, isColumnSortable);
    if (input) {
      sort.push(input);
    }
  }

  if (sort.length === 0) {
    return undefined;
  }

  return Array.isArray(sortInput) ? sort : sort[0] ?? null;
}
