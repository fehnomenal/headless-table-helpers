# @fehnomenal/headless-table-helpers

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
