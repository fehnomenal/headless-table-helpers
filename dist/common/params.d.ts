export type OffsetParamNames = Partial<Record<keyof typeof defaultOffsetParamNames, string>>;
export type CursorParamNames = Partial<Record<keyof typeof defaultCursorParamNames, string>>;
export declare const defaultOffsetParamNames: {
    rowsPerPage: string;
    sort: string;
    currentOffset: string;
};
export declare const defaultCursorParamNames: {
    rowsPerPage: string;
    sort: string;
    cursorId: string;
    cursorSort: string;
    direction: string;
};
