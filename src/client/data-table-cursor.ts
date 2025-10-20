import { readonly, writable, type Readable } from 'svelte/store';
import { buildSortString } from '../common/sort.js';
import type { DeepAwaited } from '../loader/index.js';
import type { CursorDataTableLoaderResult } from '../loader/result.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import { apply } from '../utils/apply.js';
import {
  getBaseDataTableData,
  updateDataTable,
  type BaseDataTable,
  type CursorDataTableStore,
  type DataTableClientConfig,
} from './data-table-common.js';
import {
  getPages,
  mkGetParamsForSort,
  mkParamsApplier,
  normalizeRowsPerPageOptions,
  stringifyValue,
  type ParamsApplier,
} from './utils.js';

export type ClientCursorDataTableArgs<O, Column extends string> = [
  meta: DataTableCursorPaginationMeta<Column>,
  loaderResult: CursorDataTableLoaderResult<O> | DeepAwaited<CursorDataTableLoaderResult<O>>,
  config?: DataTableClientConfig<DataTableCursorPaginationMeta<Column>>,
];

type UpdateDataTable<O, Column extends string> = (...args: ClientCursorDataTableArgs<O, Column>) => void;

export type CursorDataTable<O, Column extends string> = Readable<
  BaseDataTable<O, Column> & Pick<DataTableCursorPaginationMeta<Column>, 'paramNames' | 'sort'>
>;

export type ClientCursorDataTable<O, Column extends string> = CursorDataTable<O, Column> & {
  update: UpdateDataTable<O, Column>;
};

export const clientDataTableCursor = <O extends Record<string, unknown>, Column extends string>(
  ...[meta, loaderResult, config]: ClientCursorDataTableArgs<O, Column>
): ClientCursorDataTable<O, Column> => {
  const dataTable: CursorDataTableStore<O, Column> = writable({
    ...getBaseDataTableData(meta),
    paramNames: meta.paramNames,
    sort: meta.sort,
  });

  const update: UpdateDataTable<O, Column> = (meta, loaderResult, config) => {
    const paramApplier = mkParamsApplier(meta, config);
    normalizeRowsPerPageOptions(meta);

    const { currentPage, totalPages } = getPages(meta, loaderResult, config);

    updateDataTable(
      dataTable,
      meta,
      mkGetParamsForSort(meta, [meta.sort], paramApplier),
      getParamsForPagination(meta, paramApplier, null, null),
      currentPage,
      totalPages,
      loaderResult,
    );

    apply(loaderResult.rows, (rows) =>
      dataTable.update((prev) => ({
        ...prev,
        paramsForPreviousPage: getParamsForPagination(meta, paramApplier, getCursor(rows[0], meta), 'before'),
        paramsForNextPage: getParamsForPagination(
          meta,
          paramApplier,
          getCursor(rows[rows.length - 1], meta),
          'after',
        ),
      })),
    );

    apply(loaderResult.lastPageCursor, (cursor) =>
      dataTable.update((prev) => ({
        ...prev,
        paramsForLastPage:
          cursor === null ? null : getParamsForPagination(meta, paramApplier, cursor, 'after'),
      })),
    );
  };

  update(meta, loaderResult, config);

  return { ...readonly(dataTable), update };
};

const getParamsForPagination = (
  meta: DataTableCursorPaginationMeta<string>,
  applyParams: ParamsApplier,
  cursor: { id: unknown; sort: unknown } | null,
  direction: 'before' | 'after' | null,
) =>
  applyParams<DataTableCursorPaginationMeta<string>>({
    rowsPerPage: meta.rowsPerPage.toString(),
    cursorId: cursor ? stringifyValue(cursor.id) : null,
    sort: meta.sort.field !== meta.idColumn ? buildSortString(meta.sort) : null,
    cursorSort: meta.sort.field !== meta.idColumn && cursor ? stringifyValue(cursor.sort) : null,
    direction: direction,
  });

const getCursor = (
  row: Record<string, unknown> | undefined,
  meta: DataTableCursorPaginationMeta<string>,
) => ({
  id: row?.[meta.idColumn],
  sort: row?.[meta.sort.field],
});
