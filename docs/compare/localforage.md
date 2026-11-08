---
title: Moving from localForage to Strata Storage
sidebar_label: From localForage
description: Swap localForage's getItem and setItem for Strata Storage calls, copy existing IndexedDB values across, and check them before clearing the old store.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from localForage

localForage and Strata Storage both give you async key-value calls over IndexedDB. If your app only ever runs in a browser and you're happy with localForage, there's no reason to move. It starts to pay off once the same code also ships under Capacitor, or you want `sessionStorage`, cookies or the URL behind the same call.

## localForage calls, renamed

| localForage | Strata Storage |
|---|---|
| `localforage.setItem(key, value)` | `storage.set(key, value)` |
| `localforage.getItem(key)` | `storage.get(key)` |
| `localforage.removeItem(key)` | `storage.remove(key)` |
| `localforage.keys()` | `storage.keys()` |
| `localforage.clear()` | `storage.clear()` |
| `localforage.config({ driver })` | `defineStorage({ defaultStorages })` |

There's no `iterate()`: call `keys()` and `get()` in a loop, or use [`query()`](../guides/features/queries.md) when you're filtering on a field of the value.

## Carry existing values over

The two libraries don't share a database. Strata's IndexedDB adapter opens its own (`StrataStorage` unless you configure `dbName`), so existing values have to be copied once. Run this at startup before anything reads the moved keys.

```ts
import localforage from 'localforage';
import { defineStorage } from 'strata-storage';

export const storage = defineStorage({ defaultStorages: ['indexedDB', 'localStorage', 'memory'] });

export async function moveFromLocalForage(): Promise<void> {
  if (await storage.get<boolean>('moved:localforage')) return;
  for (const key of await localforage.keys()) {
    await storage.set(key, await localforage.getItem(key));
  }
  await storage.set('moved:localforage', true);
}
```

The flag goes last, so a tab closed halfway repeats the copy on the next start instead of skipping what's left.

## Before you clear the old store

Read a few real keys back through `storage.get()`. If you keep `Blob` values, read one of those too: IndexedDB can hold it, but a `localStorage` fallback can't. Once you're satisfied, ship `await localforage.clear()` in a later release, so a rollback still finds its data.

Adding native stores is a separate step: see [Capacitor setup](../migration.md#capacitor-setup) and check the read on a [device](../guides/platforms/device-verification.md).

## What localForage's pages say

Read on 7 Nov 2026, from localForage's README and its npm entry. Neither says anything about sessionStorage, cookies, the URL, the iOS Keychain, Android secure storage or native preferences, so those rows are left out; Strata has an adapter for each. That silence isn't proof the library can't do them. [Check localForage yourself](https://github.com/localForage/localForage) to confirm, or compare on the [side-by-side page](https://stratastorage.aoneahsan.com/compare/localforage).

| Store or capability | localForage | Strata Storage |
|---|---|---|
| localStorage | Yes ([source](https://github.com/localForage/localForage/blob/master/README.md), 7 Nov 2026) | Yes |
| IndexedDB | Yes ([source](https://github.com/localForage/localForage/blob/master/README.md), 7 Nov 2026) | Yes |
| Web and native stores behind one API | No. The README says it is designed to run in the browser; no native store is described ([source](https://github.com/localForage/localForage/blob/master/README.md), 7 Nov 2026) | Yes |
| No runtime dependencies | No. Depends on lie ([source](https://registry.npmjs.org/localforage/latest), 7 Nov 2026) | Yes |

| Package fact | localForage | Strata Storage |
|---|---|---|
| Licence | Apache-2.0 ([source](https://registry.npmjs.org/localforage/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 1.10.0 | 3.1.4 |
| Bundle size | 8,680 bytes gzipped, 28,346 minified, version 1.10.0, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=localforage)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 11,046,386, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/localforage)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
