# IndexedDB Adapter

Store structured key-value data in the browser's IndexedDB database.

## Setup

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  adapters: {
    indexedDB: { dbName: 'MyAppDB', version: 1 },
  },
});

await storage.set('draft:123', { title: 'First draft' }, {
  storage: 'indexedDB',
});
const draft = await storage.get<{ title: string }>('draft:123', {
  storage: 'indexedDB',
});
```

`StrataConfig.adapters.indexedDB` accepts `dbName` and `version`. Its store layout is managed by the adapter. It does not accept a custom object-store schema, an upgrade callback, or an `onBlocked` callback.

## Key-value operations

```typescript
await storage.set('draft:124', { title: 'Second draft' }, {
  storage: 'indexedDB',
  ttl: 86_400_000,
});

const draftKeys = await storage.keys(/^draft:/, {
  storage: 'indexedDB',
});

for (const key of draftKeys) {
  const value = await storage.get(key, { storage: 'indexedDB' });
  // Use the value in your application.
}
```

The `Strata` instance exposes no `transaction()` method. Sequential `set()` calls do not make an atomic group. For atomic updates across several records, custom indexes, or blocked-upgrade events, use the browser IndexedDB API directly.

IndexedDB quotas and persistent-storage decisions are browser controlled. Applications can inspect `navigator.storage.estimate()` and request persistence with `navigator.storage.persist()` where supported.

## See also

- [Storage adapters](../README.md)
- [Query guide](../../../guides/features/queries.md)
