# Cache Adapter

Store Strata key-value data in the browser Cache API.

## Setup

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  adapters: { cache: { cacheName: 'myapp-data-v1' } },
});

await storage.set('api:/items', { items: ['one', 'two'] }, {
  storage: 'cache',
  ttl: 300_000,
});

const cached = await storage.get<{ items: string[] }>('api:/items', {
  storage: 'cache',
});
```

The adapter uses **string keys and JSON-serializable values**. It serializes data inside Cache API responses; it does not store a `Request` or `Response` as the value you receive from `storage.get()`. Use the browser's Cache API directly when you need HTTP request matching or a `Response` object.

## Availability and behavior

The current adapter requires `window` and `window.caches`. It is available from a supported browser page, not from a service worker global scope. Cache API availability and storage quota depend on the browser and origin. Values expire through Strata's TTL handling; an expired value is not a stale-response fallback.

`StrataConfig.adapters.cache` accepts `cacheName`. Per-call `StorageOptions` does not accept Cache API matching flags such as `ignoreSearch`, `ignoreMethod`, or `ignoreVary`.

```typescript
const keys = await storage.keys(/^api:/, { storage: 'cache' });
for (const key of keys) {
  await storage.remove(key, { storage: 'cache' });
}
```

## See also

- [Offline support example](../../../examples/offline-support.md)
- [TTL guide](../../../guides/features/ttl.md)
