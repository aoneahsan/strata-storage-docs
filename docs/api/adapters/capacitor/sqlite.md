# SQLite adapter

The optional Capacitor SQLite adapter stores Strata key/value records in a native SQLite database on iOS and Android. Strata's public API remains key/value based: it does not expose raw SQL, indexes or atomic SQL transactions through `storage`.

## Register and verify

```typescript
import { defineStorage } from 'strata-storage';
import { SqliteAdapter } from 'strata-storage/capacitor';

const storage = defineStorage({ defaultStorages: ['sqlite'] });
storage.registerAdapter(new SqliteAdapter());
await storage.refreshAdapters();

await storage.set('user:1', { age: 32, city: 'Lahore' }, {
  storage: 'sqlite',
});
const user = await storage.get<{ age: number; city: string }>('user:1', {
  storage: 'sqlite',
});
```

This needs a running Capacitor iOS or Android app and a synced native project. It cannot prove a native read from a browser tab. Repeat the read after app restart and follow the [device verification guide](../../../guides/platforms/device-verification.md).

## Separate native stores

`SqliteAdapter` accepts `database` and `table` constructor options. Use distinct instances when different domains need different physical stores:

```typescript
const settings = defineStorage({ defaultStorages: ['sqlite'] });
settings.registerAdapter(new SqliteAdapter({
  database: 'settings',
  table: 'preferences',
}));
await settings.refreshAdapters();

await settings.set('theme', 'dark', { storage: 'sqlite' });
```

Database and table identifiers are validated. Do not pass arbitrary user input as either name. The native implementation's multi-store and value-wrapper changes still require the project device matrix before a production claim.

## Query decoded values

`storage.query()` checks fields of the value returned by `get()`. It does not query the physical key, Strata wrapper metadata, or a `value.*` path:

```typescript
const adultsInLahore = await storage.query<{ age: number; city: string }>({
  age: { $gte: 18 },
  city: 'Lahore',
}, { storage: 'sqlite' });
```

To find keys by name, use `storage.keys(/^user:/, { storage: 'sqlite' })`. For a pending record, store `syncStatus` inside the value and query `{ syncStatus: 'pending' }`. Querying through Strata reads and evaluates decoded records; it is not a native indexed SQL query. If your app needs indexed SQL queries, use a native database API directly.

## Size and expiry

`SqliteAdapter.size(true)` returns a byte breakdown for keys, values and metadata in the native implementation. Numbers depend on the actual records and platform. Strata's TTL makes expired values read as missing, and `cleanupExpired()` can reclaim them. Verify these behaviours on the target device before relying on them.

## Transaction boundary

The adapter exposes a best-effort sequential batch internally; `capabilities.transactional` is false. A failed later operation does not roll back an earlier committed write. Build an application-level recovery path when several writes must succeed together.

The native backend, isolation, expiry and size paths are tracked in [device verification](../../../guides/platforms/device-verification.md). No simulator or physical-device result is claimed by this page.
