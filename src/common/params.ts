export type OffsetParamNames = Partial<Record<keyof typeof defaultOffsetParamNames, string>>;
export type CursorParamNames = Partial<Record<keyof typeof defaultCursorParamNames, string>>;

const defaultBaseParamNames = {
  rowsPerPage: 'per_page',
  sort: 'sort',
};

export const defaultOffsetParamNames = {
  currentOffset: 'offset',
  ...defaultBaseParamNames,
};

export const defaultCursorParamNames = {
  cursorId: 'id_c',
  cursorSort: 'sort_c',
  direction: 'dir',
  ...defaultBaseParamNames,
};
