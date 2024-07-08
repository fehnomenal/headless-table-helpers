export const calcPage = (offset: number, perPage: number) => Math.floor(offset / perPage) + 1;

export const calcTotalPages = (totalRows: number, perPage: number) => Math.ceil(totalRows / perPage);

export const calcOffset = (page: number, perPage: number) => (page - 1) * perPage;
