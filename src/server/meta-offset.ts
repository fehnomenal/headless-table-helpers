import { defaultOffsetParamNames, type OffsetParamNames } from '../common/params.js';
import type { SortInput } from '../common/sort.js';
import {
  extractParamsFromInput,
  getBaseDataTableMeta,
  getIntParam,
  getSort,
  type BaseDataTableMeta,
} from './meta-common.js';
import type { DataTableConfig, Input } from './types.js';

export type DataTableOffsetPaginationMeta<Column extends string> = BaseDataTableMeta<Column> & {
  type: 'offset';
  paramNames: Required<OffsetParamNames>;
  currentOffset: number;
  sort: SortInput<Column>[];
};

export function getDataTableOffsetPaginationMeta<Column extends string>(
  input: Input,
  config?: DataTableOffsetPaginationConfig<Column>,
): DataTableOffsetPaginationMeta<Column> {
  const params = extractParamsFromInput(input);
  const paramNames = { ...defaultOffsetParamNames, ...config?.paramNames };

  const meta = getBaseDataTableMeta(params, paramNames, config);

  const currentOffset = Math.max(getIntParam(params.get(paramNames.currentOffset), 0), 0);

  const sort = getSort(params.getAll(paramNames.sort), config) ?? config?.defaultSort ?? [];

  return {
    type: 'offset',
    ...meta,
    paramNames,
    currentOffset,
    sort,
  };
}

type DataTableOffsetPaginationConfig<Column extends string> = DataTableConfig<Column> & {
  paramNames?: OffsetParamNames;
  defaultSort?: SortInput<Column>[];
};
