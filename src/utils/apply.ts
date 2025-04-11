export const apply = <T, O>(val: T, cb: (val: Awaited<T>) => O | PromiseLike<O>): O | PromiseLike<O> => {
  if (isPromise(val)) {
    // @ts-expect-error
    return val.then(cb);
  } else {
    // @ts-expect-error
    return cb(val);
  }
};

export const applyMany = <T extends readonly unknown[] | [], O>(
  values: T,
  cb: (vals: { -readonly [P in keyof T]: Awaited<T[P]> }) => O | PromiseLike<O>,
): O | PromiseLike<O> => {
  if (values.some(isPromise)) {
    return Promise.all(values).then(cb);
  } else {
    // @ts-expect-error
    return cb(values);
  }
};

export const isPromise = <T>(val: T | PromiseLike<T>): val is PromiseLike<T> =>
  // @ts-expect-error
  typeof val?.then === 'function';
