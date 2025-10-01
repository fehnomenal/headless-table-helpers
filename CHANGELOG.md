# @fehnomenal/headless-table-helpers

## 5.2.1

### Patch Changes

- Correctly convert dates to strings in parameters _[`#35`](https://github.com/fehnomenal/headless-table-helpers/pull/35) [`7b5a93a`](https://github.com/fehnomenal/headless-table-helpers/commit/7b5a93a61930b8413dff97ed8b5ab1816d279d9e) [@fehnomenal](https://github.com/fehnomenal)_

## 5.2.0

### Minor Changes

- Enable even more types of additional parameters: entries as `[string, string][]` and convert object values with arrays to multiple occurrences of the same parameter _[`#30`](https://github.com/fehnomenal/headless-table-helpers/pull/30) [`1e12a94`](https://github.com/fehnomenal/headless-table-helpers/commit/1e12a94170ab2a75a83caa84f55d587b0180abd6) [@fehnomenal](https://github.com/fehnomenal)_

## 5.1.0

### Minor Changes

- Accept more types for additional parameters: `URLSerachParams` and a function to manipulate them as required _[`#28`](https://github.com/fehnomenal/headless-table-helpers/pull/28) [`c09479d`](https://github.com/fehnomenal/headless-table-helpers/commit/c09479d67cf4087ad5907798b453269e2dfaa42b) [@fehnomenal](https://github.com/fehnomenal)_

### Patch Changes

- Apply additional parameters **AFTER** pagination parameters _[`#28`](https://github.com/fehnomenal/headless-table-helpers/pull/28) [`c09479d`](https://github.com/fehnomenal/headless-table-helpers/commit/c09479d67cf4087ad5907798b453269e2dfaa42b) [@fehnomenal](https://github.com/fehnomenal)_

## 5.0.0

### Major Changes

- Make the passed `orderBy` argument a function that can be `$call`ed. _[`#25`](https://github.com/fehnomenal/headless-table-helpers/pull/25) [`e84281c`](https://github.com/fehnomenal/headless-table-helpers/commit/e84281cd19a95c6febc5c010df6b979dc33f99d8) [@fehnomenal](https://github.com/fehnomenal)_

  To migrate:

  ```diff
  - .orderBy(orderBy)
  + .$call(orderBy)
  ```

### Patch Changes

- Additional query parameters do no longer override paging parameters _[`#20`](https://github.com/fehnomenal/headless-table-helpers/pull/20) [`4a39a7f`](https://github.com/fehnomenal/headless-table-helpers/commit/4a39a7f3410dba17f84964070410590a722199ab) [@fehnomenal](https://github.com/fehnomenal)_

## 4.0.0

### Major Changes

- Make dedicated functions on the client accept the same kind of parameters as the generic function _[`#14`](https://github.com/fehnomenal/headless-table-helpers/pull/14) [`6afe56d`](https://github.com/fehnomenal/headless-table-helpers/commit/6afe56d14d07293c39ec92ff94828c5009fe2d80) [@fehnomenal](https://github.com/fehnomenal)_

  Update by passing the arguments not as an array but as single arguments.

### Minor Changes

- Also handle loader results that are fully resolved _[`#12`](https://github.com/fehnomenal/headless-table-helpers/pull/12) [`efbe91d`](https://github.com/fehnomenal/headless-table-helpers/commit/efbe91d301cab280fecbf6835d536deacf9406af) [@fehnomenal](https://github.com/fehnomenal)_
- Decouple column types from the type of the returned rows _[`#17`](https://github.com/fehnomenal/headless-table-helpers/pull/17) [`95b7f5e`](https://github.com/fehnomenal/headless-table-helpers/commit/95b7f5e455109ba1be12a2bc886804e870dd74f6) [@fehnomenal](https://github.com/fehnomenal)_

## 3.3.0

### Minor Changes

- Allow setting a default sort for cursor pagination _[`#9`](https://github.com/fehnomenal/headless-table-helpers/pull/9) [`db113a4`](https://github.com/fehnomenal/headless-table-helpers/commit/db113a4c6e3f9ffd6b8dea25ac86862781f1974b) [@fehnomenal](https://github.com/fehnomenal)_

## 3.2.0

### Minor Changes

- Also export concrete implementations for better tree-shaking _[`#5`](https://github.com/fehnomenal/headless-table-helpers/pull/5) [`7b61c25`](https://github.com/fehnomenal/headless-table-helpers/commit/7b61c2522fb8eddeb130a70e88e87c7de0727598) [@fehnomenal](https://github.com/fehnomenal)_

### Patch Changes

- Prevent modifying the default rows per page options _[`#8`](https://github.com/fehnomenal/headless-table-helpers/pull/8) [`20f54a3`](https://github.com/fehnomenal/headless-table-helpers/commit/20f54a3c4512b6b810a2610cb979383b61c66466) [@fehnomenal](https://github.com/fehnomenal)_

## 3.1.2

### Patch Changes

- Automate releasing _[`#2`](https://github.com/fehnomenal/headless-table-helpers/pull/2) [`b89ec19`](https://github.com/fehnomenal/headless-table-helpers/commit/b89ec199b6ca53aaf9aa58ccf6423df46630e390) [@fehnomenal](https://github.com/fehnomenal)_
- Allow release workflow in this repo _[`#3`](https://github.com/fehnomenal/headless-table-helpers/pull/3) [`d550b16`](https://github.com/fehnomenal/headless-table-helpers/commit/d550b165d13f19e4158e4e33012cd3b1ba50e23b) [@fehnomenal](https://github.com/fehnomenal)_

## 3.1.1

### Patch Changes

- 7e28f2c: Make column config types more explicit

## 3.1.0

### Minor Changes

- ef8656b: Add selected columns to config

## 3.0.0

### Major Changes

- adf6cea: Allow transforming values for cells

## 2.1.0

### Minor Changes

- 8fcc1f6: Allow customizing the column meta

## 2.0.0

### Major Changes

- c38672a: Add column helpers for Svelte

  **breaking:** This requires Svelte 5

### Patch Changes

- ed8e537: Also allow Svelte 5

## 1.0.1

### Patch Changes

- 73e299a: Minify and split built files

## 1.0.0

### Major Changes

- Initial implementation
