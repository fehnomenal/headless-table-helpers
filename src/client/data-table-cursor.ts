import { readonly, writable, type Readable } from 'svelte/store';
import { buildSortString } from '../common/sort.js';
import type { CursorDataTableLoaderResult } from '../loader/result.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import {
  getBaseDataTableData,
  updateDataTable,
  type BaseDataTable,
  type CursorDataTableStore,
  type DataTableClientConfig,
} from './data-table-common.js';
import {
  convertAdditionalParameters,
  getPages,
  mkGetParamsForSort,
  normalizeRowsPerPageOptions,
} from './utils.js';

export type ClientCursorDataTableArgs<Column extends string, O> = [
  meta: DataTableCursorPaginationMeta<Column>,
  loaderResult: CursorDataTableLoaderResult<O>,
  config?: DataTableClientConfig<Column, DataTableCursorPaginationMeta<Column>>,
];

type UpdateDataTable<Column extends string, O> = (...args: ClientCursorDataTableArgs<Column, O>) => void;

export type CursorDataTable<Column extends string, O> = Readable<
  BaseDataTable<Column, O> & Pick<DataTableCursorPaginationMeta<Column>, 'paramNames' | 'sort'>
>;

export type ClientCursorDataTable<Column extends string, O> = CursorDataTable<Column, O> & {
  update: UpdateDataTable<Column, O>;
};

export const clientDataTableCursor = <Column extends string, O extends Record<string, unknown>>(
  ...[meta, loaderResult, config]: ClientCursorDataTableArgs<Column, O>
): ClientCursorDataTable<Column, O> => {
  const additionalParamsHolder: { params: [string, string][] } = { params: [] };

  const dataTable: CursorDataTableStore<Column, O> = writable({
    ...getBaseDataTableData(meta, mkGetParamsForSort(meta, meta.sort, additionalParamsHolder)),
    paramNames: meta.paramNames,
    sort: meta.sort,
  });

  const update: UpdateDataTable<Column, O> = (meta, loaderResult, config) => {
    additionalParamsHolder.params = convertAdditionalParameters(config);
    normalizeRowsPerPageOptions(meta);

    const { currentPage, totalPages } = getPages(meta, loaderResult, config);

    updateDataTable(
      dataTable,
      meta,
      mkGetParamsForSort(meta, meta.sort, additionalParamsHolder),
      getParamsForPagination(meta, additionalParamsHolder, null, null),
      currentPage,
      totalPages,
      loaderResult,
    );

    loaderResult.rows.then((rows) =>
      dataTable.update((prev) => ({
        ...prev,
        paramsForPreviousPage: getParamsForPagination(
          meta,
          additionalParamsHolder,
          getCursor(rows[0], meta),
          'before',
        ),
        paramsForNextPage: getParamsForPagination(
          meta,
          additionalParamsHolder,
          getCursor(rows[rows.length - 1], meta),
          'after',
        ),
      })),
    );

    loaderResult.lastPageCursor.then((cursor) =>
      dataTable.update((prev) => ({
        ...prev,
        paramsForLastPage:
          cursor === null ? null : getParamsForPagination(meta, additionalParamsHolder, cursor, 'after'),
      })),
    );
  };

  update(meta, loaderResult, config);

  return { ...readonly(dataTable), update };
};

const getParamsForPagination = <Column extends string>(
  meta: DataTableCursorPaginationMeta<Column>,
  additionalParamsHolder: { params: [string, string][] },
  cursor: { id: unknown; sort: unknown } | null,
  direction: 'before' | 'after' | null,
) => {
  const params = new URLSearchParams([
    [meta.paramNames.rowsPerPage, meta.rowsPerPage.toString()],
    ...additionalParamsHolder.params,
  ]);

  if (cursor) {
    params.set(meta.paramNames.cursorId, `${cursor.id}`);
  }

  if (meta.sort.field !== meta.idColumn) {
    params.set(meta.paramNames.sort, buildSortString(meta.sort));

    if (cursor) {
      params.set(meta.paramNames.cursorSort, `${cursor.sort}`);
    }
  }

  if (direction) {
    params.set(meta.paramNames.direction, direction);
  }

  return params as URLSearchParams;
};

const getCursor = <Column extends string>(
  row: Record<string, unknown> | undefined,
  meta: DataTableCursorPaginationMeta<Column>,
) => ({
  id: row?.[meta.idColumn],
  sort: row?.[meta.sort.field],
});
