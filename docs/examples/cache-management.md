# Cache management examples

A cache is useful only when a miss can be recovered. These examples cache JSON data in a browser adapter and let TTL remove stale entries. Strata's Cache adapter stores JSON-serializable key/value data; it is not the browser's `Request`/`Response` cache.

## Read-through cache

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ namespace: 'api-cache' });

type Profile = { id: string; name: string };

async function getProfile(id: string): Promise<Profile> {
  const key = `profile:${id}`;
  const cached = await storage.get<Profile>(key, { storage: 'indexedDB' });
  if (cached !== null) return cached;

  const response = await fetch(`/api/profiles/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Profile request failed');
  const profile = await response.json() as Profile;

  await storage.set(key, profile, {
    storage: 'indexedDB',
    ttl: 5 * 60 * 1000,
  });
  return profile;
}
```

The endpoint and response shape belong to your application. Validate the server response before trusting it, and show an error if the network read or local write fails. A cached profile can be stale until its TTL expires; choose a TTL appropriate to your data.

## Invalidate a key family

```typescript
await storage.clear({ storage: 'indexedDB', prefix: 'profile:' });
```

`clear()` accepts filters such as `prefix`, `pattern` and `olderThan`. It does not accept a callback `filter`. To inspect keys first, use `storage.keys(/^profile:/, { storage: 'indexedDB' })`.

## Measure your cache

A `query()` result contains `{ key, value }`, not TTL metadata. It cannot report how many stored entries are expired. Track hits and misses in your application if that metric matters. For a byte estimate, `storage.size(true)` reports adapter totals; test its output on the adapter and runtime you ship rather than assuming a fixed capacity or latency.

If you need to cache HTTP `Response` objects in a service worker, use the browser Cache API directly. Strata's Cache adapter currently requires `window` and does not run in service-worker scope.
