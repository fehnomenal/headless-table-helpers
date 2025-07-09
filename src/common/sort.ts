import { assertNever } from '../utils/assert-never.js';

type Asc = 'asc';
type Desc = 'desc';
type Dir = Asc | Desc;

export type SortInput<Column extends string> = {
  field: Column;
  dir: Dir;
};

export const extractSortInput = <Column extends string>(
  str: string,
  validate: (input: SortInput<Column>) => boolean,
) => {
  const input = getSortInput<Column>(str);
  return input && validate(input) ? input : null;
};

const getSortInput = <Column extends string>(str: string): SortInput<Column> | null => {
  let idx = str.lastIndexOf(':asc');
  if (idx > 0) {
    return {
      field: str.slice(0, idx) as Column,
      dir: 'asc',
    };
  }

  idx = str.lastIndexOf(':desc');
  if (idx > 0) {
    return {
      field: str.slice(0, idx) as Column,
      dir: 'desc',
    };
  }

  return null;
};

export const buildSortString = <Column extends string>({ field, dir }: SortInput<Column>): string =>
  `${field}:${dir}`;

export function invertSort(dir: Asc): Desc;
export function invertSort(dir: Desc): Asc;
export function invertSort(dir: Dir): Dir;
export function invertSort(dir: Dir) {
  if (dir === 'asc') {
    return 'desc';
  }

  if (dir === 'desc') {
    return 'asc';
  }

  assertNever(dir);
}
