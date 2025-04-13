import type { Component, Snippet } from 'svelte';
import type { ClientDataTable } from '../client/data-table-common.ts';
import type { ExclusifyUnion, OneProp } from './common/types.ts';
import type { ColumnMeta } from './meta.ts';

type Helpers<Row extends Record<string, unknown>> = ReturnType<typeof createDataTableHelper<Row>>;

export type DataTableColumnConfig<Row extends Record<string, unknown>> = {
  [K in keyof Helpers<Row>]: ReturnType<Helpers<Row>[K]>;
}[keyof Helpers<Row>];

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

export const createDataTableHelper = <Row extends Record<string, unknown>>(
  _dataTable: ClientDataTable<Row, string>,
) => ({
  accessor: createAccessorHelper<Row>(),

  group: createGroupHelper<Row>(),

  static: createStaticHelper<Row>(),
});

function createAccessorHelper<Row extends Record<string, unknown>>() {
  type Header = ExclusifyUnion<OneProp<HeaderConfig>>;
  type Cell<Value> = ExclusifyUnion<OneProp<CellConfig<Row, { value: Value }>>>;

  type Return = {
    type: 'accessor';
    column?: keyof Row & string;
    value: (row: Row) => any;
    meta?: ColumnMeta;
  } & Partial<HeaderConfig> &
    Partial<CellConfig<Row, { value: any }>>;

  function accessorHelper<Col extends keyof Row & string>(
    column: Col,
    config?: Partial<Header> & Partial<Cell<Row[Col]>> & { meta?: ColumnMeta },
  ): Return;

  function accessorHelper<T>(fn: (row: Row) => T, config: Header & Cell<T> & { meta?: ColumnMeta }): Return;

  function accessorHelper(
    columnOrFn: (keyof Row & string) | ((row: Row) => any),
    config?: Partial<Header> & Partial<Cell<any>> & { meta?: ColumnMeta },
  ): Return {
    return {
      type: 'accessor',
      column: typeof columnOrFn === 'string' ? columnOrFn : undefined,
      value: typeof columnOrFn === 'string' ? (row) => row[columnOrFn] : columnOrFn,
      ...config,
    };
  }

  return accessorHelper;
}

function createGroupHelper<Row extends Record<string, unknown>>() {
  type Header = ExclusifyUnion<OneProp<HeaderConfig>>;
  type Cell<Column extends keyof Row> = ExclusifyUnion<
    OneProp<CellConfig<Row, { value: Pick<Row, Column> }>>
  >;

  type Return = {
    type: 'group';
    columns: (keyof Row & string)[];
    value: (row: Row) => any;
    meta?: ColumnMeta;
  } & Header &
    Cell<keyof Row>;

  return function groupHelper<Columns extends (keyof Row & string)[]>(
    columns: Columns,
    config: Header & Cell<Columns[number]> & { meta?: ColumnMeta },
  ): Return {
    return {
      type: 'group',
      columns,
      value: (row) => Object.fromEntries(columns.map((col) => [col, row[col]])),
      ...config,
    };
  };
}

function createStaticHelper<Row extends Record<string, unknown>>() {
  type Header = ExclusifyUnion<OneProp<HeaderConfig>>;
  type Cell = ExclusifyUnion<OneProp<CellConfig<Row, never>>>;

  type Return = {
    type: 'static';
    meta?: ColumnMeta;
  } & Header &
    Cell;

  return function staticHelper(config: Header & Cell & { meta?: ColumnMeta }): Return {
    return {
      type: 'static',
      ...config,
    };
  };
}
