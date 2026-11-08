---
title: Moving from idb-keyval to Strata Storage
sidebar_label: From idb-keyval
description: Swap idb-keyval's get, set and del for Strata Storage calls and copy existing entries, with what you give up in bundle size.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from idb-keyval

idb-keyval is a fraction of Strata Storage's size (the figures are below). If IndexedDB key-value is all you need, keep it. The case for moving is expiry, encryption or cross-tab sync you'd otherwise write around it yourself, or values that also have to reach a native store.

## Same verbs, one extra option

| idb-keyval | Strata Storage |
|---|---|
| `set(key, value)` | `storage.set(key, value, { storage: 'indexedDB' })` |
| `get(key)` | `storage.get(key, { storage: 'indexedDB' })` |
| `del(key)` | `storage.remove(key, { storage: 'indexedDB' })` |
| `keys()` | `storage.keys(undefined, { storage: 'indexedDB' })` |
| `clear()` | `storage.clear({ storage: 'indexedDB' })` |
| `createStore(db, store)` | `defineStorage({ adapters: { indexedDB: { dbName } } })` |

`defaultStorages: ['indexedDB']` saves you repeating the `storage` option on each call. `setMany`, `getMany` and `update` have no direct equivalent: loop over `set()` and `get()`.

## Carry existing entries over

idb-keyval accepts any valid IndexedDB key: numbers, dates and arrays as well as strings. Strata keys are strings, so decide what the others become. This keeps strings and turns numbers into strings.

```ts
import { entries } from 'idb-keyval';
import { defineStorage } from 'strata-storage';

export const storage = defineStorage({ defaultStorages: ['indexedDB', 'memory'] });

export async function moveFromIdbKeyval(): Promise<void> {
  if (await storage.get<boolean>('moved:idb-keyval')) return;
  for (const [key, value] of await entries()) {
    if (typeof key === 'string' || typeof key === 'number') {
      await storage.set(String(key), value);
    }
  }
  await storage.set('moved:idb-keyval', true);
}
```

## What you take on

You're trading 805 bytes for a larger package; the table below has both measurements. Features such as [TTL](../guides/features/ttl.md) and [encryption](../guides/features/encryption.md) are off until you ask for them, so a plain `set()` behaves as it did.

Delete the old database with idb-keyval's `clear()` in a later release, after you've read real keys back.

## idb-keyval, as its README puts it

Checked 7 Nov 2026. idb-keyval's README covers IndexedDB and its npm entry lists no dependencies. Nothing there mentions localStorage, sessionStorage, cookies, the URL, any native store, or one API across web and native, so those eight rows are left out. [Check idb-keyval yourself](https://github.com/jakearchibald/idb-keyval) to confirm; the [side-by-side page](https://stratastorage.aoneahsan.com/compare/idb-keyval) has both libraries in full.

| Store or capability | idb-keyval | Strata Storage |
|---|---|---|
| IndexedDB | Yes ([source](https://github.com/jakearchibald/idb-keyval/blob/main/README.md), 7 Nov 2026) | Yes |
| No runtime dependencies | Yes ([source](https://registry.npmjs.org/idb-keyval/latest), 7 Nov 2026) | Yes |

| Package fact | idb-keyval | Strata Storage |
|---|---|---|
| Licence | Apache-2.0 ([source](https://registry.npmjs.org/idb-keyval/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 6.3.0 | 3.1.4 |
| Bundle size | 805 bytes gzipped, 2,132 minified, version 6.3.0, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=idb-keyval)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 15,406,746, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/idb-keyval)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
