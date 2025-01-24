import { type SortInput } from '../common/sort.js';
import type { DataTableLoaderResult } from '../loader/result.js';
import type { DataTableMeta } from '../server/meta-common.js';
import type { DataTableClientConfig } from './data-table-common.js';
export declare const mkGetParamsForSort: <Column extends string>(meta: DataTableMeta<Column>, existingSort: SortInput<Column> | undefined, additionalParamsHolder: {
    params: [string, string][];
}) => (field: Column) => URLSearchParams;
export declare const convertAdditionalParameters: (config: DataTableClientConfig<string, any> | undefined) => [string, string][];
export declare const normalizeRowsPerPageOptions: (meta: DataTableMeta<string>) => void;
export declare const getPages: <Column extends string, Meta extends DataTableMeta<Column>>(meta: Meta, loaderResult: DataTableLoaderResult<unknown>, config: DataTableClientConfig<Column, Meta> | undefined) => {
    currentPage: Promise<number>;
    totalPages: Promise<number>;
};
