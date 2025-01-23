import type { Component, Snippet } from 'svelte';
import type { ClientDataTable } from '../client/data-table-common.ts';

type Helpers<Column extends string, Row extends Record<Column, unknown>> = ReturnType<
  typeof createDataTableHelper<Column, Row>
>;

export type DataTableColumnConfig<Column extends string, Row extends Record<Column, unknown>> = {
  [K in keyof Helpers<Column, Row>]: ReturnType<Helpers<Column, Row>[K]>;
}[keyof Helpers<Column, Row>];

type OneProp<T> = {
  [K in keyof T]: Record<K, T[K]>;
}[keyof T];

type AllKeys<T> = T extends any ? keyof T : never;
type ExclusifyUnion<T, K extends AllKeys<T> = AllKeys<T>> = T extends any
  ? T & Partial<Record<Exclude<K, keyof T>, never>> extends infer O
    ? { [P in keyof O]: O[P] }
    : never
  : never;

interface HeaderConfig {
  header: string | Snippet<[{ cellIdx: number }]>;
  Header: Component<{ cellIdx: number }>;
}

type CellProps<Val extends Record<string, unknown>, Row extends Record<string, unknown>> = [Val] extends [
  never,
]
  ? { row: Row; cellIdx: number; rowIdx: number }
  : Val & { row: Row; cellIdx: number; rowIdx: number };

interface CellConfig<Row extends Record<string, unknown>, Val extends Record<string, unknown>> {
  cell: Snippet<[CellProps<Val, Row>]>;
  Cell: Component<CellProps<Val, Row>>;
}

interface MetaConfig {
  meta?: {
    align?: 'c' | 'r';
  };
}

type AccessorHelper<Column extends keyof Row, Row extends Record<string, unknown>> = <Col extends Column>(
  column: Col,
  config?: Partial<ExclusifyUnion<OneProp<HeaderConfig>>> &
    Partial<ExclusifyUnion<OneProp<CellConfig<Row, { value: Row[Col] }>>>> &
    MetaConfig,
) => {
  type: 'accessor';
  column: Column;
} & Partial<HeaderConfig> &
  Partial<CellConfig<Row, { value: any }>> &
  MetaConfig;

type GroupHelper<Column extends keyof Row, Row extends Record<string, unknown>> = <Columns extends Column[]>(
  columns: Columns,
  config: ExclusifyUnion<OneProp<HeaderConfig>> &
    ExclusifyUnion<OneProp<CellConfig<Row, { values: Pick<Row, Columns[number]> }>>> &
    MetaConfig,
) => {
  type: 'group';
  columns: Columns;
} & ExclusifyUnion<OneProp<HeaderConfig>> &
  ExclusifyUnion<OneProp<CellConfig<Row, { values: any }>>> &
  MetaConfig;

type StaticHelper<Row extends Record<string, unknown>> = (
  config: ExclusifyUnion<OneProp<HeaderConfig>> &
    ExclusifyUnion<OneProp<CellConfig<Row, never>>> &
    MetaConfig,
) => {
  type: 'static';
} & ExclusifyUnion<OneProp<HeaderConfig>> &
  ExclusifyUnion<OneProp<CellConfig<Row, never>>> &
  MetaConfig;

export const createDataTableHelper = <Column extends keyof Row & string, Row extends Record<string, unknown>>(
  _dataTable: ClientDataTable<string, Row>,
): {
  accessor: AccessorHelper<Column, Row>;
  group: GroupHelper<Column, Row>;
  static: StaticHelper<Row>;
} => ({
  accessor: (column, config) => ({
    type: 'accessor',
    column,
    ...config,
  }),

  group: (columns, config) => ({
    type: 'group',
    columns,
    ...config,
  }),

  static: (config) => ({
    type: 'static',
    ...config,
  }),
});
