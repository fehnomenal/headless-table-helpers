export type SortInput<Column extends string> = {
    field: Column;
    dir: 'asc' | 'desc';
};
export declare const extractSortInput: <Column extends string>(str: string, validate: (input: SortInput<Column>) => boolean) => SortInput<Column> | null;
export declare const buildSortString: <Column extends string>({ field, dir }: SortInput<Column>) => string;
export declare function invertSort(dir: 'asc'): 'desc';
export declare function invertSort(dir: 'desc'): 'asc';
export declare function invertSort(dir: 'asc' | 'desc'): 'asc' | 'desc';
