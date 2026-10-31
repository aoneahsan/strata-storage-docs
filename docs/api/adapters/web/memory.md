# Memory adapter

The memory adapter keeps values in a JavaScript `Map`. Its values disappear when the page or process is reloaded. Use it for data you can regenerate, short-lived previews and tests.

## Use it

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();
await storage.set('draft', { title: 'First pass' }, { storage: 'memory' });
const draft = await storage.get<{ title: string }>('draft', {
  storage: 'memory',
});
```

`defineStorage()` registers memory with the standard browser adapters. A manual `new Strata()` instance needs a registered `MemoryAdapter` before use.

## Configure a limit

```typescript
const limitedStorage = defineStorage({
  adapters: { memory: { maxSize: 50 * 1024 * 1024 } },
});
```

`maxSize` is a configured byte limit, not a default allocation or a measured capacity. A write that exceeds it throws; the adapter does not evict old entries. Without a configured limit, available JavaScript heap memory is the practical boundary.

## Expiry and queries

```typescript
await storage.set('report:1', {
  tags: ['important'],
  score: 85,
}, {
  storage: 'memory',
  ttl: 300_000,
});

const matches = await storage.query<{ tags: string[]; score: number }>({
  tags: { $in: ['important'] },
  score: { $gte: 80 },
}, { storage: 'memory' });
```

`query()` matches the decoded value, not Strata's internal metadata. Its condition field names are fields of the value you stored. See the [query API](../../features/query.md) for operators.

To remove only a key family, use a supported `clear` filter:

```typescript
await storage.clear({ storage: 'memory', prefix: 'report:' });
```

Memory reads and writes are synchronous at the adapter level, and Strata also exposes async methods. Performance depends on value size and the surrounding application; measure the actual workload instead of assuming a fixed latency.

## Limits

- Reloading or restarting clears the adapter.
- A separate tab or process has a separate memory map.
- The adapter has no atomic transaction API and no automatic eviction policy.
- Use a persistent adapter when the value must survive a reload.
