import type { CursorParamNames, OffsetParamNames } from '../common/params.js';
import { type SortInput } from '../common/sort.js';
import type { DataTableCursorPaginationMeta } from './meta-cursor.js';
import type { DataTableOffsetPaginationMeta } from './meta-offset.js';
import type { DataTableConfig, Input } from './types.js';
export type DataTableMeta<Column extends string> = DataTableOffsetPaginationMeta<Column> | DataTableCursorPaginationMeta<Column>;
export type BaseDataTableMeta<Column extends string> = {
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    sortable: Column[];
};
export declare const extractParamsFromInput: (input: Input) => URLSearchParams;
export declare const getBaseDataTableMeta: <Column extends string, ParamNames extends Required<OffsetParamNames> | Required<CursorParamNames>>(params: URLSearchParams, paramNames: Required<ParamNames>, config: DataTableConfig<Column> | undefined) => BaseDataTableMeta<Column>;
export declare const getIntParam: (paramValue: string | null, defaultValue: number) => number;
export declare function getSort<Column extends string>(sortStrings: string[], config: DataTableConfig<Column> | undefined): SortInput<Column>[] | undefined;
export declare function getSort<Column extends string>(sortString: string | null, config: DataTableConfig<Column> | undefined): SortInput<Column> | undefined;
