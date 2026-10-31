---
title: Caching patterns
description: Cache serializable values with Strata Storage, a TTL, and explicit invalidation.
tags: [cache, ttl, web]
---

# Caching Patterns with Strata Storage

A cache entry should have a key, a freshness limit, and a way to invalidate it when the source changes. Strata Storage supplies key-value operations and TTL; your application decides when it is safe to use a cached value.

## Cache-Aside Pattern

```typescript
import { defineStorage } from 'strata-storage';

const cache = defineStorage({
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
});

async function getCached<T>(
  key: string,
  fetchFresh: () => Promise<T>,
  ttl: number,
): Promise<T> {
  const cached = await cache.get<T>(key);
  if (cached !== null) return cached;

  const value = await fetchFresh();
  await cache.set(key, value, { ttl });
  return value;
}
```

`defineStorage()` registers the web adapters. The first available `defaultStorages` entry becomes the default. An expired key reads as `null`; the next request calls `fetchFresh`.

## Invalidation

```typescript
await cache.remove('product:123');

const keys = await cache.keys(/^product:/);
for (const key of keys) {
  await cache.remove(key);
}
```

If a single Strata instance has several registered adapters, pass `{ storage: 'indexedDB' }` to each call when you need to target exactly that backend. A key's namespace and physical prefix are separate from a cache invalidation pattern.

## Cache API Adapter

The Strata `cache` adapter uses browser Cache storage for **string-keyed, JSON-serializable values**. It does not round-trip native `Request` or `Response` objects. Use the browser Cache API directly for HTTP request/response matching, or keep the response body as a serializable value in Strata.

```typescript
await cache.set('api:/items', { items: ['one', 'two'] }, {
  storage: 'cache',
  ttl: 300_000,
});
```

The adapter is available in a supported browser page with `window.caches`; the current implementation does not run in a service worker global scope.

## Platform Limits

The package is client-side key-value storage. It does not provide a shared server cache or a Node SQLite backend. In a Capacitor app, register native adapters before selecting `sqlite` or `preferences`; see the [Capacitor guide](../platforms/capacitor.md).

## See Also

- [TTL guide](../features/ttl.md)
- [Cache adapter](../../api/adapters/web/cache.md)
