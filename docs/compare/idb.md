---
title: Moving from idb to Strata Storage
sidebar_label: From idb
description: When to replace idb's promise-wrapped IndexedDB with Strata Storage's key-value calls, how to copy an object store, and what stops working.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from idb

idb is IndexedDB with promises: object stores, indexes, cursors and transactions stay in your hands. Strata hides all of those, so if you use them on purpose, this is the wrong move. It fits when you only ever call `get` and `put`, and you don't want to think in IndexedDB terms or you need the value elsewhere too.

## Store and key become one string

| idb | Strata Storage |
|---|---|
| `db.put('drafts', value, key)` | `storage.set('drafts:' + key, value)` |
| `db.get('drafts', key)` | `storage.get('drafts:' + key)` |
| `db.delete('drafts', key)` | `storage.remove('drafts:' + key)` |
| `db.getAllKeys('drafts')` | `storage.keys(/^drafts:/)` |
| `db.getFromIndex(...)` | `storage.query({ field: value })`, a scan with no index |
| `db.transaction(...)` | No equivalent: each call stands alone |
| `upgrade()` in `openDB` | Not needed: there's no schema to version |

If two writes must succeed or fail together, keep idb for that data. The prefix on the key is there because Strata has one key space per adapter rather than named object stores; [`namespace`](../configuration.md) is the other way to separate them.

## Copy one object store

```ts
import { openDB } from 'idb';
import { defineStorage } from 'strata-storage';

export const storage = defineStorage({ defaultStorages: ['indexedDB', 'memory'] });

export async function moveDrafts(): Promise<void> {
  if (await storage.get<boolean>('moved:idb-drafts')) return;
  const db = await openDB('app');
  for (const key of await db.getAllKeys('drafts')) {
    await storage.set(`drafts:${String(key)}`, await db.get('drafts', key));
  }
  db.close();
  await storage.set('moved:idb-drafts', true);
}
```

Calling `openDB` with no version opens the database as it stands and runs no upgrade. Strata's own database has a different name, so yours is left alone until you call `deleteDB` from idb, in a later release, after real keys have read back correctly.

## What idb documents

We read idb's README and npm entry on 7 Nov 2026. They describe IndexedDB, with no runtime dependencies, and stop there. Other web stores, the URL, the native stores and a shared web-and-native API don't come up, so those rows are gone from this table. [Check idb yourself](https://github.com/jakearchibald/idb), or compare on the [side-by-side page](https://stratastorage.aoneahsan.com/compare/idb).

| Store or capability | idb | Strata Storage |
|---|---|---|
| IndexedDB | Yes ([source](https://github.com/jakearchibald/idb/blob/main/README.md), 7 Nov 2026) | Yes |
| No runtime dependencies | Yes ([source](https://registry.npmjs.org/idb/latest), 7 Nov 2026) | Yes |

| Package fact | idb | Strata Storage |
|---|---|---|
| Licence | ISC ([source](https://registry.npmjs.org/idb/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 8.0.4 | 3.1.4 |
| Bundle size | 1,493 bytes gzipped, 3,650 minified, version 8.0.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=idb)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 36,224,449, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/idb)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
