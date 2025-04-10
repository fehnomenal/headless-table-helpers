# @fehnomenal/headless-table-helpers

This package contains functions to help in building data tables. It supports
sorting and pagination both offset and cursor based.

## Installation

Choose the one for your package manager.

```sh
npm install -D @fehnomenal/headless-table-helpers
```

```sh
yarn install -D @fehnomenal/headless-table-helpers
```

```sh
pnpm install -D @fehnomenal/headless-table-helpers
```

```sh
bun add -D @fehnomenal/headless-table-helpers
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

// You can also import `createKyselyCursorDataTableLoader` or
// `createKyselyOffsetDataTableLoader` to benefit from better tree-shaking.
// The base function will delegate to these depending on the type of `meta`.

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

// You can also import `clientDataTableCursor` or `clientDataTableOffset` to
// benefit from better tree-shaking. The base function will delegate to these
// depending on the type of `meta`.

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

### Column helpers

For some UI frameworks (currently only Svelte 5) helper functions are provided to
easily build an array of columns to display:

```ts
import { createDataTableHelper } from '@fehnomenal/headless-table-helpers/column-helpers/svelte';

const h = createDataTableHelper(dataTable);
```

The helper has functions for easily create columns that access single values
(`h.accessor`), grouped values (`h.group`) or static values (`h.static`). All
of these functions are correctly typed.

Each column can have an object of meta information attached. You can strictly
type this object with the following snippet inside a `*.d.ts` file that is
included in your project.

```ts
declare module '@fehnomenal/headless-table-helpers/column-helpers/meta' {
  interface ColumnMeta {
    align?: 'c' | 'r';
  }
}
```

## Development and publishing

### Dev

```sh
> bun i
> git switch -c ...
> # work work work and commit stuff
> # add a changeset if it is an user-visible change
> bun changeset
> git add .changeset
> git commit -m "changeset"
> git push
```

### Publish

Publishing is done through the changesets bot and action.
