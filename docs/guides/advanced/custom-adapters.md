---
title: Custom adapter registration
description: Register an adapter manually on a Strata instance and understand the current StorageType typing limit.
tags: [adapters, advanced]
---

# Custom Storage Adapters Guide

`Strata.registerAdapter()` accepts an object implementing the `StorageAdapter` contract. The class constructor does **not** register any adapters, so manual registration must happen before the first operation.

## Manual Registration

```typescript
import { Strata, MemoryAdapter } from 'strata-storage';

const storage = new Strata({ defaultStorages: ['memory'] });
storage.registerAdapter(new MemoryAdapter());
await storage.initialize();

await storage.set('draft', { title: 'First draft' }, { storage: 'memory' });
const draft = await storage.get<{ title: string }>('draft', {
  storage: 'memory',
});
```

If you register another adapter after initialization, call `await storage.refreshAdapters()` to attach it and update the default selection.

## Adapter Contract

`BaseAdapter` implements common `clear`, `has`, query, observation, TTL and lifecycle behavior. A subclass supplies `name`, `capabilities`, `isAvailable`, `initialize`, `get`, `set`, `remove` and `keys`. `get()` and `set()` exchange a full `StorageValue<T>` wrapper, including timestamps and optional expiry, tags and metadata; a bare value does not satisfy the contract.

The published `StorageType` is a fixed union of built-in adapter names. A new arbitrary name such as `'redis'` is **not type-safe** with the current public `StorageType` and `StorageOptions.storage` definitions. Do not cast it into the union and present it as supported. If you need a new named adapter, extend the package's type and runtime contract first; this guide documents registration for names the package currently accepts.

## Validation

Register the adapter on a fresh `Strata`, run `set` → `get` → `remove` → `get`, then check `keys`, `clear`, TTL and `close`. Run availability and persistence checks on the target platform. The [adapter reference](../../api/adapters/README.md) lists the built-in names.
