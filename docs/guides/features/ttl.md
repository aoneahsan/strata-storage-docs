---
title: Time-to-live guide
description: Expire Strata Storage keys with a relative TTL, an absolute date, or sliding expiration.
tags: [ttl, expiry]
---

# Time-to-Live (TTL) Guide

`ttl` is a duration in milliseconds. `expireAt` is a `Date` or an absolute epoch-millisecond timestamp. A read of an expired key returns `null`.

## Quick Start

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  ttl: { autoCleanup: true, cleanupInterval: 60_000 },
});

await storage.set('draft', { title: 'First draft' }, {
  ttl: 3_600_000,
});
const draft = await storage.get<{ title: string }>('draft');
```

`defineStorage()` registers the web adapters and initializes on first use. Call `registerCapacitorAdapters(storage)` before selecting a native adapter in a Capacitor app.

## Expiration Options

```typescript
await storage.set('short_cache', data, { ttl: 300_000 });
await storage.set('daily_cache', data, {
  expireAt: new Date('2027-01-01T00:00:00Z'),
});
await storage.set('active_session', data, {
  ttl: 1_800_000,
  sliding: true,
});
```

`sliding: true` extends an item's expiry on access. `expireAfter` is a backward-compatible alias of **absolute** `expireAt`; for a duration from now, use `ttl`.

## Inspect and Change Expiry

```typescript
const remainingMs = await storage.getTTL('short_cache');
await storage.extendTTL('short_cache', 60_000);
const expiring = await storage.getExpiring(300_000);
await storage.persist('short_cache');
const removed = await storage.cleanupExpired();
```

`getTTL()` returns `null` for a key without an expiry. `extendTTL()` requires an existing key. `persist()` removes its expiry. `getExpiring()` returns keys and `expiresIn` values inside the requested window. `cleanupExpired()` returns the number removed. There is no `setTTL()` method on the public `Strata` instance; write the value again with a new `ttl` or `expireAt` when that is what you need.

## Cleanup Configuration

`StrataConfig.ttl` accepts `defaultTTL`, `cleanupInterval`, `autoCleanup`, `batchSize`, `slidingTTL` and `onExpire`. The default cleanup interval is 60 seconds; `autoCleanup: false` disables the periodic sweep. A value can still be treated as expired when read.

## See Also

- [TTL API reference](../../api/features/ttl.md)
- [Caching patterns](../patterns/caching.md)
