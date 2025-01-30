import type { Component, Snippet } from 'svelte';
import type { ClientDataTable } from '../client/data-table-common.ts';
import type { ExclusifyUnion, OneProp } from './common/types.ts';
import type { ColumnMeta } from './meta.ts';

type Helpers<Column extends string, Row extends Record<Column, unknown>> = ReturnType<
  typeof createDataTableHelper<Column, Row>
>;

export type DataTableColumnConfig<Column extends string, Row extends Record<Column, unknown>> = {
  [K in keyof Helpers<Column, Row>]: ReturnType<Helpers<Column, Row>[K]>;
}[keyof Helpers<Column, Row>];

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

export const createDataTableHelper = <Column extends keyof Row & string, Row extends Record<string, unknown>>(
  _dataTable: ClientDataTable<string, Row>,
) => ({
  accessor: createAccessorHelper<Row, Column>(),

  group: createGroupHelper<Row, Column>(),

  static: createStaticHelper<Row>(),
});

function createAccessorHelper<Row extends Record<string, unknown>, Column extends keyof Row>() {
  function accessorHelper<Col extends Column>(
    column: Col,
    config?: Partial<ExclusifyUnion<OneProp<HeaderConfig>>> &
      Partial<ExclusifyUnion<OneProp<CellConfig<Row, { value: Row[Col] }>>>> & { meta?: ColumnMeta },
  ): {
    type: 'accessor';
    column: Col;
    value: (row: Row) => Row[Col];
  } & NonNullable<typeof config>;

  function accessorHelper<T>(
    fn: (row: Row) => T,
    config: ExclusifyUnion<OneProp<HeaderConfig>> &
      ExclusifyUnion<OneProp<CellConfig<Row, { value: T }>>> & { meta?: ColumnMeta },
  ): {
    type: 'accessor';
    column: never;
    value: (row: Row) => T;
  } & typeof config;

  function accessorHelper(
    columnOrFn: (Column & string) | ((row: Row) => any),
    config?: Partial<ExclusifyUnion<OneProp<HeaderConfig>>> &
      Partial<ExclusifyUnion<OneProp<CellConfig<Row, { value: any }>>>> & { meta?: ColumnMeta },
  ): {
    type: 'accessor';
    column: any;
    value: (row: Row) => any;
  } & typeof config {
    const value = typeof columnOrFn === 'string' ? (row: Row) => row[columnOrFn] : columnOrFn;

    return {
      type: 'accessor',
      column: typeof columnOrFn === 'string' ? columnOrFn : undefined,
      value,
      ...config,
    };
  }

  return accessorHelper;
}

function createGroupHelper<Row extends Record<string, unknown>, Column extends keyof Row>() {
  return function groupHelper<Columns extends Column[]>(
    columns: Columns,
    config: ExclusifyUnion<OneProp<HeaderConfig>> &
      ExclusifyUnion<OneProp<CellConfig<Row, { value: Pick<Row, Columns[number]> }>>> & {
        meta?: ColumnMeta;
      },
  ): {
    type: 'accessor';
    columns: Columns;
    values: (row: Row) => Pick<Row, Columns[number]>;
  } & typeof config {
    return {
      type: 'accessor',
      columns,
      values: (row: Row) =>
        Object.fromEntries(columns.map((col: Columns[number]) => [col, row[col]])) as Pick<
          Row,
          Columns[number]
        >,
      ...config,
    };
  };
}

function createStaticHelper<Row extends Record<string, unknown>>() {
  return function staticHelper(
    config: ExclusifyUnion<OneProp<HeaderConfig>> &
      ExclusifyUnion<OneProp<CellConfig<Row, never>>> & { meta?: ColumnMeta },
  ): {
    type: 'static';
  } & typeof config {
    return {
      type: 'static',
      ...config,
    };
  };
}
