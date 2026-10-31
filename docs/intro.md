---
slug: /
sidebar_position: 1
description: Strata Storage provides one key/value API for browser and Capacitor storage adapters, with explicit setup for native paths and optional features.
keywords: [strata storage, capacitor storage, indexeddb, sqlite, encryption, cross-platform storage]
---

# Introduction

Strata Storage gives browser and Capacitor apps one `set()` and `get()` shape across several storage adapters. The adapter still matters: browser, iOS and Android values live in different places, and a browser read cannot prove a native read.

## First browser round-trip

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();
await storage.set('draft', { title: 'First pass' }, { storage: 'indexedDB' });
const draft = await storage.get<{ title: string }>('draft', {
  storage: 'indexedDB',
});
```

`defineStorage()` registers the standard browser adapters and initializes on first use. Memory, localStorage, sessionStorage, IndexedDB, cookies and a JSON-value Cache adapter are included. The URL adapter is registered separately for shareable UI state.

## What changes by platform

| Runtime | Available path | Verification boundary |
|---|---|---|
| Browser page | Standard web adapters through `defineStorage()` | Test the selected browser, quota and reload behaviour |
| Capacitor iOS/Android | Register Preferences, Secure, SQLite or Filesystem adapters | Run write → read → restart → read on a device |
| Node or server process | Memory and explicitly supported adapters | Do not assume a browser or native backend exists |

The native Secure adapter uses iOS Keychain or Android EncryptedSharedPreferences. Strata does not expose a biometric requirement or guarantee hardware-backed keys through its public options. Native adapter read paths still require [device verification](./guides/platforms/device-verification.md).

## Optional features

- Encryption and compression need an instance configured for those transforms. An encrypted write also needs an encryption password. Follow the [encryption](./guides/features/encryption.md) and [compression](./guides/features/compression.md) guides before enabling them.
- TTL can expire stored values. Query conditions match fields of the decoded value; wrapper metadata is not queryable. See [TTL](./guides/features/ttl.md) and the [query reference](./api/features/query.md).
- Cross-tab notifications can help refresh browser views. They do not make multi-tab writes atomic. Optional Firebase integration requires its own project and setup; it is not automatic cross-device sync.

## Next steps

1. [Install the package](./installation.md).
2. [Run the Quick Start](./quick-start.md).
3. [Choose an adapter](./api/adapters/README.md).
4. [Read the API reference](./api/core/strata.md).
