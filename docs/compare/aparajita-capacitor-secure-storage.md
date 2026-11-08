---
title: Moving from @aparajita/capacitor-secure-storage to Strata Storage
sidebar_label: From @aparajita/capacitor-secure-storage
description: Replace SecureStorage calls with Strata Storage's secure adapter and copy JSON values across, and when iCloud Keychain sync means you should stay.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from @aparajita/capacitor-secure-storage

Stay if you use iCloud Keychain sync or per-item keychain access. Strata's `secure` adapter offers neither, and copying wouldn't bring them along. Without those needs, moving makes sense when the secure store is one of several your app writes to.

## Secure calls, with the store named

| @aparajita/capacitor-secure-storage | Strata Storage |
|---|---|
| `SecureStorage.set(key, data)` | `storage.set(key, data, { storage: 'secure' })` |
| `SecureStorage.get(key)` | `storage.get(key, { storage: 'secure' })` |
| `SecureStorage.remove(key)` | `storage.remove(key, { storage: 'secure' })` |
| `SecureStorage.keys()` | `storage.keys(undefined, { storage: 'secure' })` |
| `SecureStorage.clear()` | `storage.clear({ storage: 'secure' })` |
| `SecureStorage.setKeyPrefix(prefix)` | `{ namespace }` on each call |

Both take JSON-style data, so values don't need reshaping.

## Copy on the device

```ts
import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

export const storage = defineStorage();

export async function moveSecrets(): Promise<void> {
  await registerCapacitorAdapters(storage);
  if (await storage.get<boolean>('moved:aparajita', { storage: 'secure' })) return;
  for (const key of await SecureStorage.keys()) {
    const value = await SecureStorage.get(key);
    if (value !== null) await storage.set(key, value, { storage: 'secure' });
  }
  await storage.set('moved:aparajita', true, { storage: 'secure' });
}
```

If you set a key prefix or sync option on the old plugin, set the same ones before this runs: `keys()` only lists the current prefix.

## On the web

The plugin's README says not to use it on the web in production. On Strata the `secure` adapter is native only too. For a web build, pick a browser store and turn on [encryption](../guides/features/encryption.md). Encryption needs a password from somewhere, and one shipped inside your bundle protects nothing, so that's a design decision you'll have to make.

Check the moved values on [each device](../guides/platforms/device-verification.md) before you clear the old entries in a later release.

## What the README and npm entry say

Checked 7 Nov 2026 against the plugin's README and its npm entry. Where a row says "Not stated on the pages we checked", those pages didn't mention it either way. [Check @aparajita/capacitor-secure-storage yourself](https://github.com/aparajita/capacitor-secure-storage), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/aparajita-capacitor-secure-storage).

| Store or capability | @aparajita/capacitor-secure-storage | Strata Storage |
|---|---|---|
| localStorage | Partly. On the web data is stored unencrypted in localStorage for debugging only; the README says not to use it on the web in production ([source](https://github.com/aparajita/capacitor-secure-storage/blob/main/README.md), 7 Nov 2026) | Yes |
| IndexedDB | Not stated on the pages we checked | Yes |
| sessionStorage | Not stated on the pages we checked | Yes |
| Cookies | Not stated on the pages we checked | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Yes ([source](https://github.com/aparajita/capacitor-secure-storage/blob/main/README.md), 7 Nov 2026) | Yes |
| Android secure storage (Keystore-backed) | Yes ([source](https://github.com/aparajita/capacitor-secure-storage/blob/main/README.md), 7 Nov 2026) | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Partly. One API for the secure store only ([source](https://github.com/aparajita/capacitor-secure-storage/blob/main/README.md), 7 Nov 2026) | Yes |
| No runtime dependencies | No. Depends on @capacitor/app, @capacitor/ios, @capacitor/core, @capacitor/android and @capacitor/keyboard ([source](https://registry.npmjs.org/@aparajita/capacitor-secure-storage/latest), 7 Nov 2026) | Yes |

| Package fact | @aparajita/capacitor-secure-storage | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/@aparajita/capacitor-secure-storage/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 8.0.1 | 3.1.4 |
| Bundle size | 3,535 bytes gzipped, 8,954 minified, version 8.0.1, 7 Nov 2026. JavaScript side only; the native code is not counted by bundlephobia ([source](https://bundlephobia.com/api/size?package=@aparajita/capacitor-secure-storage)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 607,888, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/@aparajita/capacitor-secure-storage)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
