---
title: Moving from store2 to Strata Storage
sidebar_label: From store2
description: Swap store2's store.get and store.set for Strata Storage's synchronous calls, map namespaces, and copy localStorage values without touching Strata's own keys.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from store2

store2 is synchronous and so are Strata's `localStorage` and `sessionStorage` calls, so most of this is a rename. For a site that only touches those two areas, store2 is the smaller package and a move buys you nothing. Move when values also need IndexedDB, a cookie, the URL or a native store.

## The calls

| store2 | Strata Storage |
|---|---|
| `store.set(key, value)` | `storage.setSync(key, value, { storage: 'localStorage' })` |
| `store.get(key)` | `storage.getSync(key, { storage: 'localStorage' })` |
| `store.remove(key)` | `storage.removeSync(key, { storage: 'localStorage' })` |
| `store.has(key)` | `storage.hasSync(key, { storage: 'localStorage' })` |
| `store.keys()` | `storage.keysSync(undefined, { storage: 'localStorage' })` |
| `store.session.set(key, value)` | `storage.setSync(key, value, { storage: 'sessionStorage' })` |
| `store.namespace('cart').set(key, value)` | `storage.setSync(key, value, { storage: 'localStorage', namespace: 'cart' })` |

The sync calls can't encrypt or compress. Those need the async `set()` and `get()`.

## Copy what's there

store2 keeps plain JSON strings under your key. Strata writes under a `strata:` prefix inside its own envelope, so the two can share `localStorage` while you copy. `store.getAll()` sees every key in the area, including Strata's, so skip those.

```ts
import store from 'store2';
import { DEFAULT_WEB_KEY_PREFIX, defineStorage } from 'strata-storage';

export const storage = defineStorage({ defaultStorages: ['localStorage', 'memory'] });

export function moveFromStore2(): void {
  if (storage.getSync<boolean>('moved:store2')) return;
  for (const [key, value] of Object.entries(store.getAll())) {
    if (!key.startsWith(DEFAULT_WEB_KEY_PREFIX)) storage.setSync(key, value);
  }
  storage.setSync('moved:store2', true);
}
```

Your old keys stay in place until you remove them, and other code may own some of them, so list the ones you're deleting by name. [Key ownership](../configuration.md#key-ownership) explains what Strata will and won't touch.

If you'd rather move one raw value and drop the original in the same step, `storage.importRawSync('theme', 'theme', { storage: 'localStorage' })` does that, but it keeps the raw string, so you'd call `JSON.parse` on what comes back.

## store2 as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check store2 yourself](https://github.com/nbubna/store), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/store2).

| Store or capability | store2 | Strata Storage |
|---|---|---|
| localStorage | Yes ([source](https://github.com/nbubna/store/blob/master/README.md), 7 Nov 2026) | Yes |
| IndexedDB | Not stated on the pages we checked | Yes |
| sessionStorage | Yes ([source](https://github.com/nbubna/store/blob/master/README.md), 7 Nov 2026) | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Not stated on the pages we checked | Yes |
| Android secure storage (Keystore-backed) | Not stated on the pages we checked | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Not stated on the pages we checked | Yes |
| No runtime dependencies | Yes ([source](https://registry.npmjs.org/store2/latest), 7 Nov 2026) | Yes |

| Package fact | store2 | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/store2/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 2.14.4 | 3.1.4 |
| Bundle size | 1,645 bytes gzipped, 4,503 minified, version 2.14.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=store2)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 2,773,240, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/store2)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
