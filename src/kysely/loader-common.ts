import type { SelectQueryBuilder } from 'kysely';

export type OrderBy<DB, TB extends keyof DB & string> = <O>(
  qb: SelectQueryBuilder<DB, TB, O>,
) => SelectQueryBuilder<DB, TB, O>;

export const getTotalRows = <DB, TB extends keyof DB>(
  query: SelectQueryBuilder<DB, TB, Record<string, never>>,
) =>
  query
    .select((eb) => eb.fn.countAll<number>().as('count'))
    .executeTakeFirstOrThrow()
    .then((r) => r.count);
