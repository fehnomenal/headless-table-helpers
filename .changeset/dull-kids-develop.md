---
'@fehnomenal/headless-table-helpers': major
---

**This release fully migrates to [Svelte Runes](https://svelte.dev/docs/svelte/what-are-runes).**

There should no longer be problems with loosing reactivity in the client.

Also the old function `clientDataTable` that delegates to the correct implementation is removed.
Instead new classes `ClientDataTableOffset` and `ClientDataTableCursor` are exported and need to be
used.

The migrations looks like this:

```diff
-const dataTable = clientDataTable(meta, result, {...});
+const dataTable = new ClientDataTableOffset(() => meta, () => result, () => ({...}));
```

All calls to `dataTable.update` are no longer needed (and not even possible) because passing
closures for the values makes manual updating unnecessary.

Also all references to `$dataTable` (i.e. accessing the store) need to be updated to directly access
the properties, as the object is no longer a svelte store.

`$dataTable.isLoadingRows` is removed. Instead use `dataTable.rows.loading`.
