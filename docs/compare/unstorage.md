---
title: Moving from unstorage to Strata Storage
sidebar_label: From unstorage
description: Swap unstorage's getItem and setItem for Strata Storage calls in client code, map drivers to adapters, and when server drivers mean you should stay.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from unstorage

Stay on unstorage if the same code runs on servers or edge runtimes, or you mount Redis, S3 or Cloudflare KV. Strata has no server drivers and doesn't try to. Move when your storage is all on the device and you want the Keychain, Android encrypted preferences, SQLite, cookies or the URL.

## The calls

| unstorage | Strata Storage |
|---|---|
| `store.setItem(key, value)` | `storage.set(key, value)` |
| `store.getItem(key)` | `storage.get(key)` |
| `store.hasItem(key)` | `storage.has(key)` |
| `store.removeItem(key)` | `storage.remove(key)` |
| `store.getKeys()` | `storage.keys()` |
| `store.clear()` | `storage.clear()` |
| `store.watch(callback)` | `storage.subscribe(callback)` |
| `driver: localStorageDriver()` | `{ storage: 'localStorage' }` |
| `driver: indexedDbDriver()` | `{ storage: 'indexedDB' }` |
| `store.mount('prefs', driver)` | `{ storage: 'preferences' }` on the calls that need it |

Instead of mounting a driver at a path, you name the adapter on the call, or set the order once with `defaultStorages`.

## Copy what's there

```ts
import { createStorage } from 'unstorage';
import localStorageDriver from 'unstorage/drivers/localstorage';
import { DEFAULT_WEB_KEY_PREFIX, defineStorage } from 'strata-storage';

export const storage = defineStorage({ defaultStorages: ['localStorage', 'memory'] });

export async function moveFromUnstorage(): Promise<void> {
  if (await storage.get<boolean>('moved:unstorage')) return;
  const old = createStorage({ driver: localStorageDriver({}) });
  for (const key of await old.getKeys()) {
    if (!key.startsWith(DEFAULT_WEB_KEY_PREFIX)) await storage.set(key, await old.getItem(key));
  }
  await storage.set('moved:unstorage', true);
}
```

The prefix check stops the copy picking up Strata's own entries when both libraries share `localStorage`. unstorage normalises separators to `:`, so a key written as `a/b` comes through as `a:b`. Update any code that builds those keys by hand.

Set a `base` on the old driver if you used one, or you'll list keys outside your own area. Read real keys back before you remove them.

## unstorage as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check unstorage yourself](https://unstorage.unjs.io), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/unstorage).

| Store or capability | unstorage | Strata Storage |
|---|---|---|
| localStorage | Yes ([source](https://unstorage.unjs.io/drivers), 7 Nov 2026) | Yes |
| IndexedDB | Yes. Through idb-keyval ([source](https://unstorage.unjs.io/drivers), 7 Nov 2026) | Yes |
| sessionStorage | Yes ([source](https://unstorage.unjs.io/drivers), 7 Nov 2026) | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Not stated on the pages we checked | Yes |
| Android secure storage (Keystore-backed) | Not stated on the pages we checked | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Yes. Requires installing @capacitor/preferences separately ([source](https://unstorage.unjs.io/drivers/capacitor-preferences), 7 Nov 2026) | Yes |
| Web and native stores behind one API | Yes. Drivers are mounted on one storage instance; the native driver covers preferences only ([source](https://unstorage.unjs.io/guide), 7 Nov 2026) | Yes |
| No runtime dependencies | Yes. No dependencies field; each driver's backend package is installed by you ([source](https://registry.npmjs.org/unstorage/latest), 7 Nov 2026) | Yes |

| Package fact | unstorage | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/unstorage/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 2.0.0-beta.0. The registry's latest tag resolved to 2.0.0-beta.0 on 2026-11-07 | 3.1.4 |
| Bundle size | 5,453 bytes gzipped, 18,024 minified, version 2.0.0-beta.0, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=unstorage)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 25,875,178, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/unstorage)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
