import type { BaseDataTableLoaderResult, DataTableLoaderResult } from './result.js';

export type {
  CursorDataTableLoaderResult,
  DataTableLoaderResult,
  OffsetDataTableLoaderResult,
} from './result.js';

export type InferSingleDataTableLoaderOutput<T extends BaseDataTableLoaderResult<unknown>> =
  T extends BaseDataTableLoaderResult<infer O> ? O : never;

export type DeepAwaited<T> = {
  [K in keyof T]: Awaited<T[K]>;
};

export const preloadDataTableLoaderResult = async <O, R extends DataTableLoaderResult<O>>(
  result: R,
): Promise<DeepAwaited<R>> => {
  const promises = Object.entries(result).map(async ([k, v]) => [k, await v]);

  const entries = await Promise.all(promises);

  return Object.fromEntries(entries);
};
