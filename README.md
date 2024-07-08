# @fehnomenal/headless-table-helpers

This package contains functions to help in building data tables. It supports
sorting and pagination both offset and cursor based.

## Installation

Choose the one for your package manager.

```sh
npm install -D 'github:fehnomenal/headless-table-helpers#semver:1.0.1'
```

```sh
yarn install -D 'github:fehnomenal/headless-table-helpers#semver:1.0.1'
```

```sh
pnpm install -D 'github:fehnomenal/headless-table-helpers#semver:1.0.1'
```

```sh
bun add -D 'github:fehnomenal/headless-table-helpers#semver:1.0.1'
```

## Usage

1. Create a meta object.
2. Load data with the meta object.
3. Initialize a data table instance.

### Create a meta object

This object contains all information needed for loading and displaying data and
providing interface elements. This function could be called on the server (like
in SvelteKit's `+page.server.ts` load functions).

Depending whether you want to do offset or cursor based navigation you need to
call different functions. Both take as first argument an `URL`, an
`URLSearchParams` or an object with type `{ url: URL }`. The second argument
are options for the call.

```ts
import { getDataTableOffsetPaginationMeta } from '@fehnomenal/headless-table-helpers/server';

// options are optional
const meta = getDataTableOffsetPaginationMeta(url);
```

```ts
import { getDataTableCursorPaginationMeta } from '@fehnomenal/headless-table-helpers/server';

const meta = getDataTableCursorPaginationMeta(url, {
  // this is required and must designate an unique column
  idColumn: 'id',
});
```

You can pass the available column names as a type argument. Doing this you
get type-safety everywhere a column name is expected:

```ts
const meta = getDataTableOffsetPaginationMeta<'id' | 'name' | 'age'>(url);
```

### Load data

Use the meta object to load data. How this is done is up to you but this
package provides an implementation for the [Kysely](https://kysely.dev)
querybuilder:

```ts
import { createKyselyDataTableLoader } from '@fehnomenal/headless-table-helpers/kysely';

const result = createKyselyDataTableLoader(
  meta,
  db.selectFrom('persons').where('name', 'like', `%${params.search}%`),
  'persons',
  (query) => query.select(['id', 'name', 'age']).execute(),
);
```

> Internally the function counts the total rows, calculates the current row
> offset and selects the corresponding rows all with regard whether this is an
> offset or cursor based pagination.
>
> These calculations are done based on the second parameter `baseQuery`. It
> must span the complete data the data table is supposed to display. If
> your table has a search function, you should apply the corresponding where
> clause here. It should also contain no selection, yet.
>
> The third parameter `sortTable` specifies which table to use to qualify
> columns used for sorting. This cannot be determined automatically from the
> `baseQuery` as this could also be a `JOIN` and thus have more than one table.
>
> The fourth parameter `executeQuery` is called to finally execute the query.
> The `query` is adjusted to include all necessary clauses for pagination and
> sorting. All you have to do is call `.select(...)` and `.execute()` and
> return the result.
>
> For more complex use cases the `orderBy` clause is also passed to
> `executeQuery`. This allows to first select the IDs and then do a
> `WHERE IN (...)` query while preserving the correct ordering.

If you're not using Kysely you have to build an object with the correct type
from [`src/loader/result.ts`](./src/loader/result.ts).

### Initialize a data table instance

Pass the `meta` object and the `loaderResult` object to the `clientDataTable`
function. The third parameter `config` is optional.

```ts
import { clientDataTable } from '@fehnomenal/headless-table-helpers/client';

const dataTable = clientDataTable(meta, result, {
  // You can pass additional data that is used to create pagination links.
  additionalData: {
    name: params.name,
  },
  // This callback function is called after the total pages could be determined.
  onTotalPages({ totalPages, currentPage, currentPageSize, meta }) {
    // For example redirect if the user navigated to a non-existing page via the address bar.
    if (currentPage > totalPages) {
      const url = new URL(window.location);
      url.searchParams.delete(meta.paramNames.currentOffset);
      window.location = url;
    }
  },
});
```

The returned object is a
[readable Svelte store](https://svelte.dev/docs/svelte-store#readable) with a
`update` method that can be used to update the internal properties. `update`
accepts the same arguments as `dataTable`. Updating instead of creating a new
object results in the table not seeming to be cleared during loading another
page.

The store provides all the properties you need to build the UI.
// TBD

# Development and publishing

## Dev

```sh
> bun i
> # work work work
> bun changeset
> git add ...
> git commit
```

## Publish

```sh
> bun version
> git add ...
> git commit -m "bump version to v..."
> bun run build
> npm2git c
> git push
> git push --tags
```
