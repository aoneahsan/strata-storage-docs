---
title: Android platform guide
description: Use Strata Storage's native Preferences, Secure, SQLite and Filesystem adapters in a Capacitor Android app.
tags: [android, capacitor]
---

# Android Platform Guide

Strata Storage's Capacitor plugin provides `preferences` (SharedPreferences), `secure` (encrypted preferences), `sqlite` and `filesystem` adapters on Android.

## Installation

```bash
yarn add strata-storage
yarn cap sync android
```

The package's Android build declares SDK 36 defaults, a minimum SDK of 23, and `androidx.security:security-crypto:1.1.0`. The host app's Android project can override SDK versions; inspect its merged configuration before release.

## Native Setup

```typescript
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const storage = defineStorage({
  defaultStorages: ['sqlite', 'preferences', 'memory'],
});
await registerCapacitorAdapters(storage);

await storage.set('theme', 'dark', { storage: 'preferences' });
await storage.set('draft:1', { title: 'First draft' }, { storage: 'sqlite' });
await storage.set('token', token, { storage: 'secure' });
```

Native adapters require a running Capacitor Android app. The Filesystem adapter uses the app's internal directory, so this API does not require broad external-storage permissions. Do not add `MANAGE_EXTERNAL_STORAGE` or legacy read/write permissions for these adapter operations.

## Storage Choices

| Adapter | Use for | Limit |
|---|---|---|
| `preferences` | Small app settings | Not encrypted |
| `secure` | Sensitive key-value data | No biometric prompt option through `StorageOptions` |
| `sqlite` | Larger structured key-value sets | Top-level `Strata` has no atomic `transaction()` API |
| `filesystem` | One file-backed JSON value per key | No directory option per call |

The `adapters.preferences` and `adapters.secure` config fields are booleans. Per-call options such as `directory`, `allowBackup`, `keyAlias` and `userAuthenticationRequired` are not in the public TypeScript API. Handle Android backup policy in the host app's native configuration rather than a Strata `set()` option.

## Verification

Run the [native device matrix](./device-verification.md) after syncing the package. Check read/write, persistence after force-stop, SQLite isolation, and file-backed operations on a device or emulator. The native bridge is not exercised by a web browser.

## See Also

- [Capacitor guide](./capacitor.md)
- [SQLite adapter](../../api/adapters/capacitor/sqlite.md)
- [Secure adapter](../../api/adapters/capacitor/secure.md)
