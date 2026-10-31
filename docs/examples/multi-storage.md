# Multi-Storage Examples

A Strata instance can select from its registered adapters. The default list chooses the first available adapter at initialization; a later write error is not automatically retried elsewhere.

## Storage Fallback Chain

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  defaultStorages: ['indexedDB', 'localStorage', 'sessionStorage', 'memory'],
});
await storage.set('draft', { title: 'First pass' });
```

Use an explicit array in an operation when the caller needs its own availability preference:

```typescript
await storage.set('draft', draft, {
  storage: ['indexedDB', 'localStorage'],
});
```

## Storage-Specific Operations

```typescript
await storage.set('profile', profile, { storage: 'indexedDB' });
await storage.set('tab', 'details', { storage: 'sessionStorage' });
await storage.set('temporary-filter', filter, { storage: 'memory', ttl: 300_000 });
```

Choose an adapter for the value's lifetime and quota. `memory` is lost when the page ends; `sessionStorage` is tab scoped.

## Platform-Adaptive Storage

```typescript
import { Capacitor } from '@capacitor/core';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const native = Capacitor.isNativePlatform();
const storage = defineStorage({
  defaultStorages: native
    ? ['sqlite', 'preferences', 'memory']
    : ['indexedDB', 'localStorage', 'memory'],
});
if (native) await registerCapacitorAdapters(storage);
```

Native stores need adapter registration and device verification. `secure` is not a browser fallback.

## Storage Migration

```typescript
const keys = await storage.keys(/^draft:/, { storage: 'localStorage' });
for (const key of keys) {
  const value = await storage.get(key, { storage: 'localStorage' });
  if (value === null) continue;
  await storage.set(key, value, { storage: 'indexedDB' });
  const copied = await storage.get(key, { storage: 'indexedDB' });
  if (copied !== null) await storage.remove(key, { storage: 'localStorage' });
}
```

Test migrations against real data before removing the old key. A non-null read alone does not prove object equality; add application-specific verification when that matters.

## Storage Load Balancing

Strata does not move values between adapters according to their current usage. Select the adapter explicitly using your application's quota and retention rules.

## Storage Sync Strategy

For cross-tab notifications, configure `sync` and subscribe to changes. It is not an atomic merge of simultaneous writes. See the [cross-tab sync guide](../guides/features/sync.md).

## Storage Type Routing

```typescript
function storageForKey(key: string): 'indexedDB' | 'memory' {
  return key.startsWith('draft:') ? 'indexedDB' : 'memory';
}

await storage.set(key, value, { storage: storageForKey(key) });
```

Do not route a browser value to a native adapter that has not been registered, or treat local storage as the server's authentication authority.

## See Also

- [Storage adapters](../api/adapters/README.md)
- [Configuration guide](../configuration.md)
