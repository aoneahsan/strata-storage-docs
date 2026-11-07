---
title: Moving from Dexie.js to Strata Storage
sidebar_label: From Dexie.js
description: When a Dexie.js database can become key-value storage, how to copy its rows into Strata Storage, and when it should stay a database.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from Dexie.js

Dexie.js is a database: versioned schemas, indexes, bulk writes, live queries. Strata Storage is a key-value layer. If your queries lean on indexes or your tables hold many thousands of rows, stay on Dexie: `storage.query()` reads and decodes every key in the store rather than using an index. This guide fits a smaller case, where Dexie ended up holding settings, drafts and caches and you also need native stores.

## The calls

| Dexie.js | Strata Storage |
|---|---|
| `db.table('drafts').put(row)` | `storage.set('draft:' + row.id, row)` |
| `db.table('drafts').get(id)` | `storage.get('draft:' + id)` |
| `db.table('drafts').delete(id)` | `storage.remove('draft:' + id)` |
| `db.table('drafts').where(...)` | `storage.query({ type: 'draft', ... })` |
| `liveQuery(...)` | `storage.subscribe(callback)` |
| `db.version(n).stores(...)` | No equivalent: there's no schema |

Queries match fields on the value you stored, not its key or tags, so a `type` field on each value is how you select one kind of record ([query guide](../guides/features/queries.md)).

## Copy one table

```ts
import Dexie from 'dexie';
import { defineStorage } from 'strata-storage';

interface Draft {
  id: number;
  title: string;
  updatedAt: number;
}

const db = new Dexie('app');
db.version(1).stores({ drafts: 'id,updatedAt' });

export const storage = defineStorage({ defaultStorages: ['indexedDB', 'memory'] });

export async function moveDrafts(): Promise<void> {
  if (await storage.get<boolean>('moved:dexie-drafts')) return;
  const rows = await db.table<Draft, number>('drafts').toArray();
  for (const row of rows) {
    await storage.set(`draft:${row.id}`, { ...row, type: 'draft' }, { tags: ['drafts'] });
  }
  await storage.set('moved:dexie-drafts', true);
}
```

## Reading it back

```ts
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ defaultStorages: ['indexedDB', 'memory'] });
const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

const recent = await storage.query<{ title: string }>({ type: 'draft', updatedAt: { $gt: weekAgo } });
console.log(recent.map(({ key, value }) => `${key}: ${value.title}`));

await storage.clear({ tags: ['drafts'] });
```

Results aren't sorted by an index, so sort them yourself. Time a query against a realistic amount of your data before you delete the Dexie code.

## Dexie.js as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check Dexie.js yourself](https://dexie.org), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/dexie).

| Store or capability | Dexie.js | Strata Storage |
|---|---|---|
| localStorage | Not stated on the pages we checked | Yes |
| IndexedDB | Yes ([source](https://github.com/dexie/Dexie.js/blob/master/README.md), 7 Nov 2026) | Yes |
| sessionStorage | Not stated on the pages we checked | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Not stated on the pages we checked | Yes |
| Android secure storage (Keystore-backed) | Not stated on the pages we checked | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Not stated on the pages we checked. The README says it supports Capacitor for iOS and Android apps, meaning IndexedDB inside the webview; no native store is described | Yes |
| No runtime dependencies | Yes ([source](https://registry.npmjs.org/dexie/latest), 7 Nov 2026) | Yes |

| Package fact | Dexie.js | Strata Storage |
|---|---|---|
| Licence | Apache-2.0 ([source](https://registry.npmjs.org/dexie/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 4.4.7 | 3.1.4 |
| Bundle size | 31,094 bytes gzipped, 97,946 minified, version 4.4.7, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=dexie)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 3,400,609, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/dexie)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
