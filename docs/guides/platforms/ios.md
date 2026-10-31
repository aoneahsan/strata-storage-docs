---
title: iOS platform guide
description: Use Strata Storage's native Preferences, Secure, SQLite and Filesystem adapters in a Capacitor iOS app.
tags: [ios, capacitor]
---

# iOS Platform Guide

Strata Storage's Capacitor plugin provides `preferences` (UserDefaults), `secure` (Keychain), `sqlite` and `filesystem` adapters on iOS.

## Installation

```bash
yarn add strata-storage
yarn cap sync ios
```

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
await storage.set('session_token', token, {
  storage: 'secure',
  ttl: 3_600_000,
});
```

The helper registers native adapters only inside a Capacitor app. Use the prepared `storage` instance throughout the application.

## Storage Choices

| Adapter | Use for | Limit |
|---|---|---|
| `preferences` | Small app settings | Not encrypted; no iCloud sync option in `StrataConfig` |
| `secure` | Sensitive key-value data | No biometric prompt or Keychain accessibility option in `StorageOptions` |
| `sqlite` | Larger structured key-value sets | Top-level `Strata` has no atomic `transaction()` API |
| `filesystem` | File-backed JSON values | Directory is fixed by the native adapter |

The Capacitor plugin definitions include lower-level Keychain and UserDefaults methods, but the `Strata` adapter options do not expose App Groups, a biometric requirement, iCloud sync, or a per-call directory. Use a separately verified native integration if your app needs one of those behaviors.

## Verification

Run the [native device matrix](./device-verification.md) on a simulator or device. Check values after force-quitting and relaunching the app, then confirm the native storage path used by each adapter. A browser test cannot prove Keychain, UserDefaults, SQLite or filesystem persistence.

## See Also

- [Capacitor guide](./capacitor.md)
- [SQLite adapter](../../api/adapters/capacitor/sqlite.md)
- [Secure adapter](../../api/adapters/capacitor/secure.md)
