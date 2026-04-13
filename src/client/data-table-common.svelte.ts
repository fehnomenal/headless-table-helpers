import { resource, watch } from 'runed';
import { buildSortString, invertSort, type SortInput } from '../common/sort.js';
import type { DataTableLoaderResult, DeepAwaited } from '../loader/index.js';
import type { BaseDataTableMeta } from '../server/meta-common.ts';
import { calcPage, calcTotalPages } from '../utils/calculations.js';
import type { Loadable, ParamsApplier } from './utils.js';

export type DataTableClientConfig<Meta extends BaseDataTableMeta<string>> = {
  /**
   * As a `Record<string, unknown>`, `[string, string][]` or `URLSearchParams`, the given params will be applied **AFTER** the pagination related parameters from this library.
   * As a function, it is passed the pagination parameters and can modify them as it wishes.
   */
  additionalParams?:
    | Record<string, unknown>
    | [string, string][]
    | URLSearchParams
    | ((params: URLSearchParams) => URLSearchParams);
  onTotalPages?: (opts: {
    currentPage: number;
    currentPageSize: number;
    totalPages: number;
    meta: Meta;
  }) => void | Promise<void>;
};

export abstract class BaseDataTable<O, M extends BaseDataTableMeta<string>> {
  public meta: M;

  public currentPage: Loadable<number>;
  public totalPages: Loadable<number>;
  public totalRows: Loadable<number>;
  public rows: Loadable<O[], true>;

  public abstract paramsForFirstPage: Loadable<URLSearchParams>;
  public abstract paramsForPreviousPage: Loadable<URLSearchParams>;
  public abstract paramsForNextPage: Loadable<URLSearchParams>;
  public abstract paramsForLastPage: Loadable<URLSearchParams | null>;

  protected abstract applyParams: ParamsApplier;

  readonly getParamsForSort: (column: string) => URLSearchParams;

  declare readonly $rowType: O;

  constructor(
    meta_: () => M,
    loaderResult_: () => DataTableLoaderResult<O> | DeepAwaited<DataTableLoaderResult<O>>,
    config_?: () => DataTableClientConfig<M>,
  ) {
    this.meta = $derived.by(() => {
      const meta = meta_();

      if (!meta.rowsPerPageOptions.includes(meta.rowsPerPage)) {
        meta.rowsPerPageOptions.push(meta.rowsPerPage);
      }
      meta.rowsPerPageOptions.sort((a, b) => a - b);

      return meta;
    });

    const loaderResult = $derived(loaderResult_());

    this.totalRows = resource(
      () => loaderResult.totalRows,
      async (rows) => await rows,
    );

    this.currentPage = resource(
      [() => loaderResult.currentOffset, () => this.meta],
      async ([currentOffset, meta]) => calcPage(await currentOffset, meta.rowsPerPage),
    );

    this.totalPages = resource([() => loaderResult.totalRows, () => this.meta], async ([totalRows, meta]) =>
      calcTotalPages(await totalRows, meta.rowsPerPage),
    );

    const rows = resource(
      () => loaderResult.rows,
      async (rows) => await rows,
      {
        // This needs to be undefined to set the initial loading to `true`. The real initial value is set
        // right after creating this resource.
        initialValue: undefined as unknown as [],
      },
    );
    rows.mutate([]);
    this.rows = rows;

    if (config_) {
      watch(
        [
          config_,
          () => this.currentPage.current,
          () => this.totalPages.current,
          () => this.rows.current,
          () => this.meta,
        ],
        ([config, currentPage, totalPages, rows, meta]) => {
          if (currentPage !== undefined && rows !== undefined && totalPages !== undefined) {
            config.onTotalPages?.({ currentPage, currentPageSize: rows?.length, totalPages, meta });
          }
        },
      );
    }

    this.getParamsForSort = $derived((field) => {
      const existingSort = this.getExistingSort(this.meta);

      const isAlreadySorted = existingSort.some((sort) => sort.field === field);

      const sort = isAlreadySorted
        ? existingSort.map((sort) => {
            const oldDirection = sort.field === field ? sort.dir : undefined;
            const dir = oldDirection ? invertSort(oldDirection) : 'asc';
            return buildSortString({ field: sort.field, dir });
          })
        : [buildSortString({ field, dir: 'asc' })];

      return this.applyParams({
        rowsPerPage: this.meta.rowsPerPage.toString(),
        sort,
      });
    });
  }

  protected abstract getExistingSort(meta: M): SortInput<string>[];
}
