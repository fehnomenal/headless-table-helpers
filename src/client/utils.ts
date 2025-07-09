import type { ResourceReturn } from 'runed';
import type { DataTableMeta } from '../server/meta-common.js';
import { assertNever } from '../utils/assert-never.js';
import type { DataTableClientConfig } from './data-table-common.svelte.js';

export type Loadable<T, HasInitialValue extends boolean = false> = Pick<
  ResourceReturn<T, unknown, HasInitialValue>,
  'current' | 'loading'
>;

export type ParamsApplier = <M extends DataTableMeta<string>>(paginationParameters: {
  [K in keyof M['paramNames']]: string | string[] | null;
}) => URLSearchParams;

export const mkParamsApplier = <M extends DataTableMeta<string>>(
  meta: M,
  config: Pick<DataTableClientConfig<never>, 'additionalParams'> | undefined,
): ParamsApplier => {
  const { additionalParams: params } = config ?? {};

  let _params: ConstructorParameters<typeof URLSearchParams>[0];

  const applyParams: ParamsApplier = (paginationParams) => {
    // Copy the params here so every invocation gets its own params.
    const params = new URLSearchParams(_params);

    for (const [key, value] of Object.entries(paginationParams)) {
      const name = (meta.paramNames as Record<string, string>)[key];
      params.delete(name);

      if (Array.isArray(value)) {
        for (const val of value) {
          params.append(name, val);
        }
      } else if (value !== null) {
        params.append(name, value);
      }
    }

    return params;
  };

  if (!params) {
    // Nothing to do here.
  } else if (typeof params === 'function') {
    return (paginationParams) => params(applyParams(paginationParams));
  } else if (params instanceof URLSearchParams || Array.isArray(params)) {
    _params = params;
  } else if (params) {
    _params = Object.entries(params)
      .filter(([, value]) => !!value)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((v) => [key, stringifyValue(v)] satisfies [string, string]);
        }

        return [[key, stringifyValue(value)] satisfies [string, string]];
      });
  } else {
    assertNever(params);
  }

  return applyParams;
};

export function stringifyValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
