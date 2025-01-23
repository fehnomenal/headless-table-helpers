import { assertNever } from '../utils/assert-never.js';

export type SortInput<Column extends string> = {
  field: Column;
  dir: 'asc' | 'desc';
};

export const extractSortInput = <Column extends string>(
  str: string,
  validate: (input: SortInput<Column>) => boolean,
) => {
  const input = getSortInput<Column>(str);
  return input && validate(input) ? input : null;
};

const getSortInput = <Column extends string>(str: string): SortInput<Column> | null => {
  if (str.endsWith(':asc')) {
    return {
      field: str.slice(0, -':asc'.length) as Column,
      dir: 'asc',
    };
  } else if (str.endsWith(':desc')) {
    return {
      field: str.slice(0, -':desc'.length) as Column,
      dir: 'desc',
    };
  }

  return null;
};

export const buildSortString = <Column extends string>({ field, dir }: SortInput<Column>) =>
  `${field}:${dir}`;

export function invertSort(dir: 'asc'): 'desc';
export function invertSort(dir: 'desc'): 'asc';
export function invertSort(dir: 'asc' | 'desc'): 'asc' | 'desc';
export function invertSort(dir: 'asc' | 'desc') {
  if (dir === 'asc') {
    return 'desc';
  }

  if (dir === 'desc') {
    return 'asc';
  }

  assertNever(dir);
}
