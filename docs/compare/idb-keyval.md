---
title: Moving from idb-keyval to Strata Storage
sidebar_label: From idb-keyval
description: Swap idb-keyval's get, set and del for Strata Storage calls and copy existing entries, with what you give up in bundle size.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from idb-keyval

idb-keyval is a fraction of Strata Storage's size (the figures are below). If IndexedDB key-value is all you need, keep it. Move when expiry, encryption or cross-tab sync would otherwise be code you write around it, or when the same values have to reach a native store.

## The calls

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

## idb-keyval as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check idb-keyval yourself](https://github.com/jakearchibald/idb-keyval), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/idb-keyval).

| Store or capability | idb-keyval | Strata Storage |
|---|---|---|
| localStorage | Not stated on the pages we checked | Yes |
| IndexedDB | Yes ([source](https://github.com/jakearchibald/idb-keyval/blob/main/README.md), 7 Nov 2026) | Yes |
| sessionStorage | Not stated on the pages we checked | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Not stated on the pages we checked | Yes |
| Android secure storage (Keystore-backed) | Not stated on the pages we checked | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Not stated on the pages we checked | Yes |
| No runtime dependencies | Yes ([source](https://registry.npmjs.org/idb-keyval/latest), 7 Nov 2026) | Yes |

| Package fact | idb-keyval | Strata Storage |
|---|---|---|
| Licence | Apache-2.0 ([source](https://registry.npmjs.org/idb-keyval/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 6.3.0 | 3.1.4 |
| Bundle size | 805 bytes gzipped, 2,132 minified, version 6.3.0, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=idb-keyval)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 15,406,746, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/idb-keyval)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
