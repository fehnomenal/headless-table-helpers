// src/utils/assert-never.ts
function assertNever(x) {
  throw new Error(`This should never happen! Expected never, got ${JSON.stringify(x)}.`);
}

// src/common/sort.ts
var extractSortInput = (str, validate) => {
  const input = getSortInput(str);
  return input && validate(input) ? input : null;
};
var getSortInput = (str) => {
  if (str.endsWith(":asc")) {
    return {
      field: str.slice(0, -":asc".length),
      dir: "asc"
    };
  } else if (str.endsWith(":desc")) {
    return {
      field: str.slice(0, -":desc".length),
      dir: "desc"
    };
  }
  return null;
};
var buildSortString = ({ field, dir }) => `${field}:${dir}`;
function invertSort(dir) {
  if (dir === "asc") {
    return "desc";
  }
  if (dir === "desc") {
    return "asc";
  }
  assertNever(dir);
}

export { assertNever, extractSortInput, buildSortString, invertSort };
