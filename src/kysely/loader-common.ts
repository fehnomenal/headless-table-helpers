import type { AnyColumn, SelectQueryBuilder } from 'kysely';

export type OrderBy<DB, TB extends keyof DB & string> = `${TB}.${AnyColumn<DB, TB>} ${'asc' | 'desc'}`;

export const getTotalRows = <DB, TB extends keyof DB>(
  query: SelectQueryBuilder<DB, TB, Record<string, never>>,
) =>
  query
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow()
    .then((r) => r.count);
