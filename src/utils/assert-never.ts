export const assertNever = (x: never): never => {
  throw new Error(`This should never happen! Expected never, got ${JSON.stringify(x)}.`);
};
