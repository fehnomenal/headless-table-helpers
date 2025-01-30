import type { Component, Snippet } from 'svelte';
import type { ClientDataTable } from '../client/data-table-common.ts';
import type { ExclusifyUnion, OneProp } from './common/types.ts';
import type { ColumnMeta } from './meta.ts';
type Helpers<Column extends string, Row extends Record<Column, unknown>> = ReturnType<typeof createDataTableHelper<Column, Row>>;
export type DataTableColumnConfig<Column extends string, Row extends Record<Column, unknown>> = {
    [K in keyof Helpers<Column, Row>]: ReturnType<Helpers<Column, Row>[K]>;
}[keyof Helpers<Column, Row>];
interface HeaderConfig {
    header: string | Snippet<[{
        cellIdx: number;
    }]>;
    Header: Component<{
        cellIdx: number;
    }>;
}
type CellProps<Val extends Record<string, unknown>, Row extends Record<string, unknown>> = [Val] extends [
    never
] ? {
    row: Row;
    cellIdx: number;
    rowIdx: number;
} : Val & {
    row: Row;
    cellIdx: number;
    rowIdx: number;
};
interface CellConfig<Row extends Record<string, unknown>, Val extends Record<string, unknown>> {
    cell: Snippet<[CellProps<Val, Row>]>;
    Cell: Component<CellProps<Val, Row>>;
}
export declare const createDataTableHelper: <Column extends keyof Row & string, Row extends Record<string, unknown>>(_dataTable: ClientDataTable<string, Row>) => {
    accessor: {
        <Col extends Column>(column: Col, config?: (Partial<ExclusifyUnion<OneProp<HeaderConfig>>> & Partial<ExclusifyUnion<OneProp<CellConfig<Row, {
            value: Row[Col];
        }>>>> & {
            meta?: ColumnMeta;
        }) | undefined): {
            type: "accessor";
            column?: Column | undefined;
            value: (row: Row) => any;
            meta?: ColumnMeta;
        } & Partial<HeaderConfig> & Partial<CellConfig<Row, {
            value: any;
        }>>;
        <T>(fn: (row: Row) => T, config: ExclusifyUnion<OneProp<HeaderConfig>> & ExclusifyUnion<OneProp<CellConfig<Row, {
            value: T;
        }>>> & {
            meta?: ColumnMeta;
        }): {
            type: "accessor";
            column?: Column | undefined;
            value: (row: Row) => any;
            meta?: ColumnMeta;
        } & Partial<HeaderConfig> & Partial<CellConfig<Row, {
            value: any;
        }>>;
    };
    group: <Columns extends Column[]>(columns: Columns, config: ExclusifyUnion<OneProp<HeaderConfig>> & ExclusifyUnion<OneProp<CellConfig<Row, {
        value: Pick<Row, Column>;
    }>>> & {
        meta?: ColumnMeta;
    }) => {
        type: "group";
        columns: Column[];
        value: (row: Row) => any;
        meta?: ColumnMeta;
    } & ExclusifyUnion<OneProp<HeaderConfig>> & ExclusifyUnion<OneProp<CellConfig<Row, {
        value: Pick<Row, Column>;
    }>>>;
    static: (config: ExclusifyUnion<OneProp<HeaderConfig>> & ExclusifyUnion<OneProp<CellConfig<Row, never>>> & {
        meta?: ColumnMeta;
    }) => {
        type: "static";
        meta?: ColumnMeta;
    } & ExclusifyUnion<OneProp<HeaderConfig>> & ExclusifyUnion<OneProp<CellConfig<Row, never>>>;
};
export {};
