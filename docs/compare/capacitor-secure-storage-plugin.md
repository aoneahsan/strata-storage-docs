---
title: Moving from capacitor-secure-storage-plugin to Strata Storage
sidebar_label: From capacitor-secure-storage-plugin
description: Replace SecureStoragePlugin calls with Strata Storage's secure adapter and copy secrets across on the device, with the limits of that adapter.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from capacitor-secure-storage-plugin

This plugin does one job: string secrets in the Keychain and in Keystore-backed preferences. If that's all your app stores, keep it. Move when the secure store sits beside others and you want one call shape for all of them.

## The calls

| capacitor-secure-storage-plugin | Strata Storage |
|---|---|
| `SecureStoragePlugin.set({ key, value })` | `storage.set(key, value, { storage: 'secure' })` |
| `SecureStoragePlugin.get({ key })` returns `{ value }` | `storage.get(key, { storage: 'secure' })` returns the value |
| `SecureStoragePlugin.remove({ key })` | `storage.remove(key, { storage: 'secure' })` |
| `SecureStoragePlugin.keys()` returns `{ value }` | `storage.keys(undefined, { storage: 'secure' })` returns the array |
| `SecureStoragePlugin.clear()` | `storage.clear({ storage: 'secure' })` |

`get()` on a missing key returns `null` here. If your code catches a rejection from the plugin to detect a missing key, change that check.

## Copy on the device

```ts
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

export const storage = defineStorage();

export async function moveSecrets(): Promise<void> {
  await registerCapacitorAdapters(storage);
  if (await storage.get<boolean>('moved:secure-plugin', { storage: 'secure' })) return;
  const { value: keys } = await SecureStoragePlugin.keys();
  for (const key of keys) {
    const { value } = await SecureStoragePlugin.get({ key });
    await storage.set(key, value, { storage: 'secure' });
  }
  await storage.set('moved:secure-plugin', true, { storage: 'secure' });
}
```

Don't log these values while you test the copy. Run `npx cap sync` after installing, or the native module never reaches your projects.

## Limits to read first

The `secure` adapter doesn't expose Keychain accessibility, a biometric requirement or an authentication prompt ([secure adapter](../api/adapters/capacitor/secure.md)). It's native only, too. A browser run won't exercise it, so check the read on [each device](../guides/platforms/device-verification.md), and only then remove the plugin's entries with `SecureStoragePlugin.clear()`, in a later release.

## capacitor-secure-storage-plugin as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check capacitor-secure-storage-plugin yourself](https://github.com/martinkasa/capacitor-secure-storage-plugin), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/capacitor-secure-storage-plugin).

| Store or capability | capacitor-secure-storage-plugin | Strata Storage |
|---|---|---|
| localStorage | Partly. On the web values go to localStorage base64-encoded; the README says the browser has no secure storage ([source](https://github.com/martinkasa/capacitor-secure-storage-plugin/blob/master/README.md), 7 Nov 2026) | Yes |
| IndexedDB | Not stated on the pages we checked | Yes |
| sessionStorage | Not stated on the pages we checked | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Yes ([source](https://github.com/martinkasa/capacitor-secure-storage-plugin/blob/master/README.md), 7 Nov 2026) | Yes |
| Android secure storage (Keystore-backed) | Yes ([source](https://github.com/martinkasa/capacitor-secure-storage-plugin/blob/master/README.md), 7 Nov 2026) | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Partly. One API for the secure store only, string values ([source](https://github.com/martinkasa/capacitor-secure-storage-plugin/blob/master/README.md), 7 Nov 2026) | Yes |
| No runtime dependencies | Yes. @capacitor/core is a peer dependency ([source](https://registry.npmjs.org/capacitor-secure-storage-plugin/latest), 7 Nov 2026) | Yes |

| Package fact | capacitor-secure-storage-plugin | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/capacitor-secure-storage-plugin/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 0.13.0 | 3.1.4 |
| Bundle size | 268 bytes gzipped, 378 minified, version 0.13.0, 7 Nov 2026. JavaScript side only; the native code is not counted by bundlephobia ([source](https://bundlephobia.com/api/size?package=capacitor-secure-storage-plugin)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 219,773, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/capacitor-secure-storage-plugin)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
