import { type OffsetParamNames } from '../common/params.js';
import type { SortInput } from '../common/sort.js';
import { type BaseDataTableMeta } from './meta-common.js';
import type { DataTableConfig, Input } from './types.js';
export type DataTableOffsetPaginationMeta<Column extends string> = BaseDataTableMeta<Column> & {
    type: 'offset';
    paramNames: Required<OffsetParamNames>;
    currentOffset: number;
    sort: SortInput<Column>[];
};
export declare function getDataTableOffsetPaginationMeta<Column extends string>(input: Input, config?: DataTableOffsetPaginationConfig<Column>): DataTableOffsetPaginationMeta<Column>;
type DataTableOffsetPaginationConfig<Column extends string> = DataTableConfig<Column> & {
    paramNames?: OffsetParamNames;
    defaultSort?: SortInput<Column>[];
};
export {};
