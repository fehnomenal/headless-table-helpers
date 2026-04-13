import { resource } from 'runed';
import { buildSortString, type SortInput } from '../common/sort.js';
import type { DeepAwaited, OffsetDataTableLoaderResult } from '../loader/index.js';
import type { DataTableOffsetPaginationMeta } from '../server/meta-offset.js';
import { calcOffset } from '../utils/calculations.js';
import { BaseDataTable, type DataTableClientConfig } from './data-table-common.svelte.js';
import { mkParamsApplier, type Loadable, type ParamsApplier } from './utils.js';

export class ClientDataTableOffset<
  O extends Record<string, unknown>,
  Column extends string,
> extends BaseDataTable<O, Column, DataTableOffsetPaginationMeta<Column>> {
  public paramNames: DataTableOffsetPaginationMeta<Column>['paramNames'];
  public sort: SortInput<Column>[];

  public paramsForFirstPage: Loadable<URLSearchParams>;
  public paramsForPreviousPage: Loadable<URLSearchParams>;
  public paramsForNextPage: Loadable<URLSearchParams>;
  public paramsForLastPage: Loadable<URLSearchParams | null>;

  protected applyParams: ParamsApplier;

  constructor(
    meta_: () => DataTableOffsetPaginationMeta<Column>,
    loaderResult_: () => OffsetDataTableLoaderResult<O> | DeepAwaited<OffsetDataTableLoaderResult<O>>,
    config_?: () => DataTableClientConfig<DataTableOffsetPaginationMeta<Column>>,
  ) {
    super(meta_, loaderResult_, config_);

    this.paramNames = $derived(this.meta.paramNames);
    this.sort = $derived(this.meta.sort);

    this.applyParams = $derived(mkParamsApplier(this.meta, config_?.()));

    this.paramsForFirstPage = resource(
      [() => this.meta, () => this.applyParams],
      async ([meta, applyParams]) => getParamsForPagination(meta, applyParams, 1),
    );

    this.paramsForPreviousPage = resource(
      [() => this.meta, () => this.applyParams, () => this.currentPage.current],
      async ([meta, applyParams, currentPage]) =>
        getParamsForPagination(meta, applyParams, (currentPage ?? 1) - 1),
    );

    this.paramsForNextPage = resource(
      [() => this.meta, () => this.applyParams, () => this.currentPage.current],
      async ([meta, applyParams, currentPage]) =>
        getParamsForPagination(meta, applyParams, (currentPage ?? 1) + 1),
    );

    this.paramsForLastPage = resource(
      [() => this.meta, () => this.applyParams, () => this.totalPages.current],
      async ([meta, applyParams, totalPages]) =>
        totalPages === undefined ? null : getParamsForPagination(meta, applyParams, totalPages),
    );
  }

  protected getExistingSort(meta: DataTableOffsetPaginationMeta<Column>): SortInput<Column>[] {
    return meta.sort;
  }
}

function getParamsForPagination(
  meta: DataTableOffsetPaginationMeta<string>,
  applyParams: ParamsApplier,
  page: number,
) {
  return applyParams<DataTableOffsetPaginationMeta<string>>({
    rowsPerPage: meta.rowsPerPage.toString(),
    currentOffset: page > 1 ? calcOffset(page, meta.rowsPerPage).toString() : null,
    sort: meta.sort.map((s) => buildSortString(s)),
  });
}
