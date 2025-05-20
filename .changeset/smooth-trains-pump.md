---
'@fehnomenal/headless-table-helpers': major
---

Make the passed `orderBy` argument a function that can be `$call`ed.

To migrate:

```diff
- .orderBy(orderBy)
+ .$call(orderBy)
```
