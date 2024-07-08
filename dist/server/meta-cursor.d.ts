import { type CursorParamNames } from '../common/params.js';
import type { SortInput } from '../common/sort.js';
import { type BaseDataTableMeta } from './meta-common.js';
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
export declare function getDataTableCursorPaginationMeta<Column extends string>(input: Input, config: DataTableCursorPaginationConfig<Column>): DataTableCursorPaginationMeta<Column>;
type DataTableCursorPaginationConfig<Column extends string> = DataTableConfig<Column> & {
    paramNames?: CursorParamNames;
    idColumn: Column;
};
export {};
