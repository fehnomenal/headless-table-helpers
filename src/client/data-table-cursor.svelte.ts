import { resource } from 'runed';
import { buildSortString, type SortInput } from '../common/sort.js';
import type { CursorDataTableLoaderResult, DeepAwaited } from '../loader/index.js';
import type { DataTableCursorPaginationMeta } from '../server/meta-cursor.js';
import { BaseDataTable, type DataTableClientConfig } from './data-table-common.svelte.js';
import { mkParamsApplier, stringifyValue, type Loadable, type ParamsApplier } from './utils.js';

export class ClientDataTableCursor<
  O extends Record<string, unknown>,
  Column extends string,
> extends BaseDataTable<O, Column, DataTableCursorPaginationMeta<Column>> {
  public paramNames: DataTableCursorPaginationMeta<Column>['paramNames'];
  public sort: SortInput<Column>;

  public paramsForFirstPage: Loadable<URLSearchParams>;
  public paramsForPreviousPage: Loadable<URLSearchParams>;
  public paramsForNextPage: Loadable<URLSearchParams>;
  public paramsForLastPage: Loadable<URLSearchParams | null>;

  protected applyParams: ParamsApplier;

  constructor(
    meta_: () => DataTableCursorPaginationMeta<Column>,
    loaderResult_: () => CursorDataTableLoaderResult<O> | DeepAwaited<CursorDataTableLoaderResult<O>>,
    config_?: () => DataTableClientConfig<DataTableCursorPaginationMeta<Column>>,
  ) {
    super(meta_, loaderResult_, config_);

    const loaderResult = $derived(loaderResult_());

    this.paramNames = $derived(this.meta.paramNames);
    this.sort = $derived(this.meta.sort);

    this.applyParams = $derived(mkParamsApplier(this.meta, config_?.()));

    this.paramsForFirstPage = resource(
      [() => this.meta, () => this.applyParams],
      async ([meta, applyParams]) => getParamsForPagination(meta, applyParams, null, null),
    );

    this.paramsForPreviousPage = resource(
      [() => this.meta, () => this.applyParams, () => loaderResult.rows],
      async ([meta, applyParams, rows]) =>
        getParamsForPagination(meta, applyParams, getCursor((await rows)[0], meta), 'before'),
    );

    this.paramsForNextPage = resource(
      [() => this.meta, () => this.applyParams, () => loaderResult.rows],
      async ([meta, applyParams, rows]) =>
        getParamsForPagination(
          meta,
          applyParams,
          getCursor((await rows)[(await rows).length - 1], meta),
          'after',
        ),
    );

    this.paramsForLastPage = resource(
      [() => this.meta, () => this.applyParams, () => loaderResult.lastPageCursor],
      async ([meta, applyParams, cursor]) =>
        (await cursor) === null ? null : getParamsForPagination(meta, applyParams, await cursor, 'after'),
    );
  }

  protected getExistingSort(meta: DataTableCursorPaginationMeta<Column>): SortInput<Column>[] {
    return [meta.sort];
  }
}

function getParamsForPagination(
  meta: DataTableCursorPaginationMeta<string>,
  applyParams: ParamsApplier,
  cursor: { id: unknown; sort: unknown } | null,
  direction: 'before' | 'after' | null,
) {
  return applyParams<DataTableCursorPaginationMeta<string>>({
    rowsPerPage: meta.rowsPerPage.toString(),
    cursorId: cursor ? stringifyValue(cursor.id) : null,
    sort: meta.sort.field !== meta.idColumn ? buildSortString(meta.sort) : null,
    cursorSort: meta.sort.field !== meta.idColumn && cursor ? stringifyValue(cursor.sort) : null,
    direction,
  });
}

function getCursor(row: Record<string, unknown> | undefined, meta: DataTableCursorPaginationMeta<string>) {
  return {
    id: row?.[meta.idColumn],
    sort: row?.[meta.sort.field],
  };
}
