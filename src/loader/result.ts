export type DataTableLoaderResult<O> = OffsetDataTableLoaderResult<O> | CursorDataTableLoaderResult<O>;

export type BaseDataTableLoaderResult<O> = {
  currentOffset: Promise<number>;
  rows: Promise<O[]>;
  totalRows: Promise<number>;
};

export type OffsetDataTableLoaderResult<O> = BaseDataTableLoaderResult<O>;

export type CursorDataTableLoaderResult<O> = BaseDataTableLoaderResult<O> & {
  lastPageCursor: Promise<{
    id: string;
    sort: string | undefined;
  } | null>;
};
