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
  type Header = ExclusifyUnion<OneProp<HeaderConfig>>;
  type Cell<Value> = ExclusifyUnion<OneProp<CellConfig<Row, { value: Value }>>>;

  type Return = {
    type: 'accessor';
    column?: Column;
    value: (row: Row) => any;
    meta?: ColumnMeta;
  } & Partial<HeaderConfig> &
    Partial<CellConfig<Row, { value: any }>>;

  function accessorHelper<Col extends Column>(
    column: Col,
    config?: Partial<Header> & Partial<Cell<Row[Col]>> & { meta?: ColumnMeta },
  ): Return;

  function accessorHelper<T>(fn: (row: Row) => T, config: Header & Cell<T> & { meta?: ColumnMeta }): Return;

  function accessorHelper(
    columnOrFn: (Column & string) | ((row: Row) => any),
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

function createGroupHelper<Row extends Record<string, unknown>, Column extends keyof Row>() {
  type Header = ExclusifyUnion<OneProp<HeaderConfig>>;
  type Cell = ExclusifyUnion<OneProp<CellConfig<Row, { value: Value }>>>;
  type Value = Pick<Row, Column>;

  type Return = {
    type: 'group';
    columns: Column[];
    value: (row: Row) => any;
    meta?: ColumnMeta;
  } & Header &
    Cell;

  return function groupHelper<Columns extends Column[]>(
    columns: Columns,
    config: Header & Cell & { meta?: ColumnMeta },
  ): Return {
    return {
      type: 'group',
      columns,
      value: (row) =>
        Object.fromEntries(columns.map((col: Columns[number]) => [col, row[col]])) as Pick<
          Row,
          Columns[number]
        >,
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
