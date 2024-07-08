import { defaultCursorParamNames, type CursorParamNames } from '../common/params.js';
import type { SortInput } from '../common/sort.js';
import {
  extractParamsFromInput,
  getBaseDataTableMeta,
  getSort,
  type BaseDataTableMeta,
} from './meta-common.js';
import type { DataTableConfig, Input } from './types.js';

export type DataTableCursorPaginationMeta<Column extends string> = BaseDataTableMeta<Column> & {
  type: 'cursor';
  paramNames: Required<CursorParamNames>;
  idColumn: Column;
  idCursor: string | undefined;
  sort: SortInput<Column>;
  sortCursor: string | undefined;
  direction: 'after' | 'before';
};

export function getDataTableCursorPaginationMeta<Column extends string>(
  input: Input,
  config: DataTableCursorPaginationConfig<Column>,
): DataTableCursorPaginationMeta<Column> {
  const params = extractParamsFromInput(input);
  const paramNames = { ...defaultCursorParamNames, ...config.paramNames };

  const meta = getBaseDataTableMeta(params, paramNames, config);

  const idCursor = params.get(paramNames.cursorId) ?? undefined;

  const sort = getSort(params.get(paramNames.sort), config) ?? { field: config.idColumn, dir: 'asc' };
  const sortCursor = params.get(paramNames.cursorSort) ?? undefined;

  const direction = params.get(paramNames.direction);

  return {
    type: 'cursor',
    ...meta,
    paramNames,
    idColumn: config.idColumn,
    idCursor,
    sort,
    sortCursor,
    direction: direction === 'before' ? direction : 'after',
  };
}

type DataTableCursorPaginationConfig<Column extends string> = DataTableConfig<Column> & {
  paramNames?: CursorParamNames;
  idColumn: Column;
};
