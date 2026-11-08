---
title: Moving from @capacitor/preferences to Strata Storage
sidebar_label: From @capacitor/preferences
description: Replace Capacitor Preferences calls with Strata Storage's preferences adapter, stop stringifying values, and copy existing keys on the device.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from @capacitor/preferences

`@capacitor/preferences` holds string values in UserDefaults, SharedPreferences and, on the web, `localStorage`. For a handful of string settings it's the simplest choice, and the Capacitor team maintains it. It's worth switching once preferences become one store among several, or after one `JSON.stringify` too many.

## Preferences calls without the `{ key }` wrapper

| @capacitor/preferences | Strata Storage |
|---|---|
| `Preferences.set({ key, value })` | `storage.set(key, value, { storage: 'preferences' })` |
| `Preferences.get({ key })` returns `{ value }` | `storage.get(key, { storage: 'preferences' })` returns the value |
| `Preferences.remove({ key })` | `storage.remove(key, { storage: 'preferences' })` |
| `Preferences.keys()` returns `{ keys }` | `storage.keys(undefined, { storage: 'preferences' })` returns the array |
| `Preferences.clear()` | `storage.clear({ storage: 'preferences' })` |

Values don't have to be strings. Objects go in and come back as objects.

## Setup and copy

Native adapters register at run time, and they need `npx cap sync` after you install the package. Without it the native module never reaches your iOS and Android projects.

```ts
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const target = Capacitor.isNativePlatform() ? 'preferences' : 'localStorage';

export const storage = defineStorage({ defaultStorages: [target, 'memory'] });

export async function moveFromPreferences(): Promise<void> {
  await registerCapacitorAdapters(storage);
  if (await storage.get<boolean>('moved:preferences')) return;
  const { keys } = await Preferences.keys();
  for (const key of keys) {
    const { value } = await Preferences.get({ key });
    if (value !== null) await storage.set(key, value);
  }
  await storage.set('moved:preferences', true);
}
```

This copies each value as the string it was. If you stored JSON, call `JSON.parse` on it first so you don't carry the stringifying forward.

Don't assume the old and new keys are the same entries, even though both end up in UserDefaults or SharedPreferences. Copy, then read back.

## Check it on a device

A browser run exercises `localStorage`, not the native path. Install a build holding old data, update to the new one, and read a moved key on both iOS and Android ([device verification](../guides/platforms/device-verification.md)). Remove the plugin in a later release.

## What the Capacitor docs say

Read on the Capacitor docs page and the npm registry, 7 Nov 2026. They don't cover IndexedDB, sessionStorage, cookies, the URL, the iOS Keychain or Android secure storage, so those rows are left out. [Check @capacitor/preferences yourself](https://capacitorjs.com/docs/apis/preferences) for yourself, or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/capacitor-preferences).

| Store or capability | @capacitor/preferences | Strata Storage |
|---|---|---|
| localStorage | Partly. Used as the fallback when running as a PWA, not chosen directly ([source](https://capacitorjs.com/docs/apis/preferences), 7 Nov 2026) | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Yes ([source](https://capacitorjs.com/docs/apis/preferences), 7 Nov 2026) | Yes |
| Web and native stores behind one API | Partly. One API over one store per platform, string values only; the page says it is not meant to be used as a local database ([source](https://capacitorjs.com/docs/apis/preferences), 7 Nov 2026) | Yes |
| No runtime dependencies | Yes. @capacitor/core is a peer dependency ([source](https://registry.npmjs.org/@capacitor/preferences/latest), 7 Nov 2026) | Yes |

| Package fact | @capacitor/preferences | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/@capacitor/preferences/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 8.0.1 | 3.1.4 |
| Bundle size | 264 bytes gzipped, 354 minified, version 8.0.1, 7 Nov 2026. JavaScript side only; the native code is not counted by bundlephobia ([source](https://bundlephobia.com/api/size?package=@capacitor/preferences)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 1,624,508, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/@capacitor/preferences)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
