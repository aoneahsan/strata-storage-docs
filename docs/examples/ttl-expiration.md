---
title: Expire local values
description: Use Strata Storage TTL, absolute expiry and expiry inspection without treating client expiry as server authentication.
tags: [examples, ttl]
---

# Expire local values

A TTL gives a stored value an expiry time. Strata returns `null` after that time and can clean expired records from adapters. Expiry is a local cache rule, not a server session or authorization boundary.

- [Relative and absolute expiry](#expiry)
- [Sliding expiry](#sliding)
- [Inspect and change expiry](#inspect)

<a id="expiry"></a>
## ⏱️ Relative and absolute expiry&nbsp;[#](#expiry)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();
const options = { storage: 'memory' as const };

await storage.set('preview', { title: 'Working copy' }, {
  ...options,
  ttl: 5 * 60 * 1000,
});

await storage.set('event-data', { count: 3 }, {
  ...options,
  expireAt: Date.now() + 60 * 60 * 1000,
});

const preview = await storage.get<{ title: string }>('preview', options);
// After its expiry, preview is null.
```

`ttl` is a duration in milliseconds from the write. `expireAt` is a future `Date` or epoch-millisecond timestamp. A past `expireAt` doesn't create a future expiry; use a relative expression when the example should keep working next year.

<a id="sliding"></a>
## 🔄 Sliding expiry&nbsp;[#](#sliding)

```typescript
const slidingStorage = defineStorage({
  defaultStorages: ['memory'],
  ttl: {
    defaultTTL: 30 * 60 * 1000,
    slidingTTL: true,
  },
});

await slidingStorage.set('draft', 'In progress', {
  storage: 'memory',
});
const draft = await slidingStorage.get<string>('draft', {
  storage: 'memory',
});
```

With `slidingTTL` and a configured `defaultTTL`, each successful read of an unexpired value refreshes its expiry. A per-write `sliding: true` flag alone does not supply the duration needed for a later read to extend it.

<a id="inspect"></a>
## 🔎 Inspect and change expiry&nbsp;[#](#inspect)

```typescript
const remainingMs = await storage.getTTL('preview', options);
const soon = await storage.getExpiring(10 * 60 * 1000, options);
for (const item of soon) {
  const key = item.key;
  const expiresInMs = item.expiresIn;
  // Use key and expiresInMs in your UI.
}

await storage.extendTTL('preview', 5 * 60 * 1000, options);
await storage.persist('preview', options);
```

`getTTL()` returns `null` for a key without expiry or one that is absent. `getExpiring()` returns `{ key, expiresIn }`, not `{ key, ttl }`. `extendTTL()` adds time to the current expiry; `persist()` removes expiry, but a memory value still disappears on reload. Run `cleanupExpired(options)` when you need to remove expired records immediately instead of waiting for a read or scheduled cleanup.

See the [TTL guide](../guides/features/ttl.md) for configuration and adapter behavior.
