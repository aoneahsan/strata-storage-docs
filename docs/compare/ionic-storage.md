---
title: Moving from @ionic/storage to Strata Storage
sidebar_label: From @ionic/storage
description: Swap Ionic Storage's create, get and set for Strata Storage calls, copy existing keys, and replace the extra SQLite and encryption pieces.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from @ionic/storage

`@ionic/storage` sits on localForage and has the same key-value shape, so the calls map one to one. If you're on Ionic with its Angular module and plan to use Ionic Secure Storage, staying is reasonable. Move when you'd rather get encryption and native stores from one package without adding drivers.

## The calls

| @ionic/storage | Strata Storage |
|---|---|
| `await store.create()` | Not needed: the instance starts on first use |
| `store.set(key, value)` | `storage.set(key, value)` |
| `store.get(key)` | `storage.get(key)` |
| `store.remove(key)` | `storage.remove(key)` |
| `store.keys()` | `storage.keys()` |
| `store.clear()` | `storage.clear()` |
| `store.forEach(fn)` | `keys()` and `get()` in a loop |
| `store.length()` | `(await storage.keys()).length` |
| `defineDriver(CordovaSQLiteDriver)` | `registerCapacitorAdapters(storage)` |

## Copy what's there

```ts
import { Storage } from '@ionic/storage';
import { defineStorage } from 'strata-storage';

export const storage = defineStorage({ defaultStorages: ['indexedDB', 'localStorage', 'memory'] });

export async function moveFromIonicStorage(): Promise<void> {
  if (await storage.get<boolean>('moved:ionic-storage')) return;
  const old = new Storage();
  await old.create();
  for (const key of await old.keys()) {
    await storage.set(key, await old.get(key));
  }
  await storage.set('moved:ionic-storage', true);
}
```

If you configured a custom `name`, `storeName` or `driverOrder`, pass the same options to `new Storage()`, or you'll open an empty store and copy nothing. Run this inside the app on the device, because that's where the old data lives.

## Native stores and encryption

On a native build, register the adapters and pick `sqlite`, `preferences` or `secure` per call ([Capacitor setup](../migration.md#capacitor-setup)). Encryption is part of the package and off by default: `{ encrypt: true }` on a `set()`, with a password in the instance's `encryption` config ([encryption guide](../guides/features/encryption.md)). It's a different format from Ionic Secure Storage, so anything encrypted there has to be read through that product first.

## @ionic/storage as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check @ionic/storage yourself](https://github.com/ionic-team/ionic-storage), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/ionic-storage).

| Store or capability | @ionic/storage | Strata Storage |
|---|---|---|
| localStorage | Yes ([source](https://github.com/ionic-team/ionic-storage/blob/main/README.md), 7 Nov 2026) | Yes |
| IndexedDB | Yes ([source](https://github.com/ionic-team/ionic-storage/blob/main/README.md), 7 Nov 2026) | Yes |
| sessionStorage | Not stated on the pages we checked | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Not stated on the pages we checked | Yes |
| Android secure storage (Keystore-backed) | Not stated on the pages we checked | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Partly. One API with a driver order; native SQLite needs a separately installed Cordova driver or Ionic Secure Storage ([source](https://github.com/ionic-team/ionic-storage/blob/main/README.md), 7 Nov 2026) | Yes |
| No runtime dependencies | No. Depends on localforage ([source](https://registry.npmjs.org/@ionic/storage/latest), 7 Nov 2026) | Yes |

| Package fact | @ionic/storage | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/@ionic/storage/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 4.0.0 | 3.1.4 |
| Bundle size | 9,446 bytes gzipped, 31,037 minified, version 4.0.0, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=@ionic/storage)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 133,551, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/@ionic/storage)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
