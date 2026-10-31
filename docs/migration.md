---
title: Strata Storage migration guide
sidebar_position: 9
description: Move to the current web factory and opt-in Capacitor adapter registration.
tags: [migration, capacitor, web]
---

# Strata Storage Migration Guide

The main package exports the `Strata` class, but `new Strata()` starts with **no registered adapters**. Use `defineStorage()` for the standard web set, or register adapters explicitly before calling storage methods. Native adapters live in the `strata-storage/capacitor` entry point.

## Web Setup

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
});

await storage.set('draft', { title: 'First draft' });
const draft = await storage.get<{ title: string }>('draft');
```

The factory registers the web adapters and initializes lazily on the first operation. Calling `initialize()` yourself is optional. A manual `new Strata()` setup must call `registerWebAdapters(storage)` or `storage.registerAdapter(...)` before use.

## Capacitor Setup

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
```

`registerCapacitorAdapters()` registers Preferences, SQLite, Secure and Filesystem on a native Capacitor platform, then refreshes the instance. It does nothing to native registration in a browser. Import it from the Capacitor subpath, not the package root.

## Existing Keys

The web `localStorage` and `sessionStorage` adapters now write with the `strata:` physical key prefix. The library can adopt its own older unprefixed storage envelopes on read. If an external script reads a physical key directly before Strata loads, configure `keyPrefix: false` and test that reader before upgrading; [configuration](./configuration.md#key-ownership) explains the ownership check.

## Verify the Migration

1. Build with the current package exports and inspect every custom `new Strata()` instance for registration.
2. Read a known pre-upgrade key, write a new value, reload and read it back.
3. On iOS and Android, sync the native project and run the [device verification guide](./guides/platforms/device-verification.md). Browser tests cannot prove native persistence.
