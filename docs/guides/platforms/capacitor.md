---
title: Capacitor platform guide
description: Register Strata Storage's native adapters in a Capacitor app and use the same key-value API on web, iOS and Android.
tags: [capacitor, ios, android]
---

# Capacitor Platform Guide

Strata Storage ships web adapters in its main entry point. Native `preferences`, `sqlite`, `secure` and `filesystem` adapters are opt-in through `strata-storage/capacitor`.

## Installation

```bash
yarn add strata-storage @capacitor/core
yarn cap sync
```

Build and sync the host app's native projects after installing the package. The native plugin only runs inside a Capacitor iOS or Android app.

## Basic Setup

```typescript
import { Capacitor } from '@capacitor/core';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const storage = defineStorage({
  defaultStorages: Capacitor.isNativePlatform()
    ? ['sqlite', 'preferences', 'memory']
    : ['indexedDB', 'localStorage', 'memory'],
});
await registerCapacitorAdapters(storage);

await storage.set('draft', { title: 'First draft' });
const draft = await storage.get<{ title: string }>('draft');
```

`defineStorage()` registers the web adapters. `registerCapacitorAdapters()` adds the native adapters and refreshes the instance on a native platform; it returns without registering them in a browser. Call it before the first native operation. Use a single prepared instance in your app rather than creating one for every screen.

## Platform Detection

```typescript
import { Capacitor } from '@capacitor/core';

const platform = Capacitor.getPlatform(); // 'web', 'ios' or 'android'
const native = Capacitor.isNativePlatform();
```

Choose an adapter explicitly when a value has a specific storage requirement:

```typescript
await storage.set('theme', 'dark', { storage: 'preferences' });
await storage.set('session_token', token, { storage: 'secure', ttl: 3_600_000 });
```

The `storage` option selects a registered adapter. It does not make `preferences` available in the browser. Keep web fallbacks in your `defaultStorages` list for shared code, and test each explicit native path on a device.

## Native Adapter Configuration

`StrataConfig.adapters.preferences` and `.secure` accept booleans. The top-level `StorageOptions` does not expose biometric prompts, per-call filesystem directories, or Android preference file names. For separate SQLite databases, create distinct `SqliteAdapter` instances, register each with its own `Strata` instance, then call `refreshAdapters()`; see the [SQLite adapter reference](../../api/adapters/capacitor/sqlite.md).

## Testing

Use the [device verification guide](./device-verification.md) on both iOS and Android. A browser test exercises web adapters and the plugin's fallback, not native persistence. After changing native code, sync and rebuild the host app before testing.

## See Also

- [Android guide](./android.md)
- [iOS guide](./ios.md)
- [Web guide](./web.md)
