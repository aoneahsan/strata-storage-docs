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

## The calls

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

## idb as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check idb yourself](https://github.com/jakearchibald/idb), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/idb).

| Store or capability | idb | Strata Storage |
|---|---|---|
| localStorage | Not stated on the pages we checked | Yes |
| IndexedDB | Yes ([source](https://github.com/jakearchibald/idb/blob/main/README.md), 7 Nov 2026) | Yes |
| sessionStorage | Not stated on the pages we checked | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Not stated on the pages we checked | Yes |
| Android secure storage (Keystore-backed) | Not stated on the pages we checked | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Not stated on the pages we checked | Yes |
| No runtime dependencies | Yes ([source](https://registry.npmjs.org/idb/latest), 7 Nov 2026) | Yes |

| Package fact | idb | Strata Storage |
|---|---|---|
| Licence | ISC ([source](https://registry.npmjs.org/idb/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 8.0.4 | 3.1.4 |
| Bundle size | 1,493 bytes gzipped, 3,650 minified, version 8.0.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=idb)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 36,224,449, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/idb)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
