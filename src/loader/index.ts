import type { BaseDataTableLoaderResult } from './result.js';

export type {
  CursorDataTableLoaderResult,
  DataTableLoaderResult,
  OffsetDataTableLoaderResult,
} from './result.js';

export type InferSingleDataTableLoaderOutput<T extends BaseDataTableLoaderResult<unknown>> =
  T extends BaseDataTableLoaderResult<infer O> ? O : never;
