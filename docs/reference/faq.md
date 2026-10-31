# Frequently asked questions

## What does Strata Storage provide?

One key/value API over browser and Capacitor adapters. The chosen adapter determines persistence and platform availability. The core package has no runtime dependencies; React, Vue, Angular, Firebase and Capacitor integrations have optional peers.

## Which runtimes are supported?

The standard browser instance registers memory, localStorage, sessionStorage, IndexedDB, cookies and a Cache-backed JSON-value adapter. Capacitor iOS and Android apps can register Preferences, Secure, SQLite and Filesystem adapters. React Native is not a supported native adapter runtime. Node or SSR code cannot assume browser or Capacitor globals exist.

## Do I call `initialize()`?

`defineStorage()` and the exported `storage` singleton register standard web adapters and initialize on first use. A manual `new Strata()` instance needs adapter registration before initialization or operations.

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();
await storage.set('draft', 'First pass');
```

## What values can I store?

Use JSON-serializable strings, numbers, booleans, arrays, plain objects and `null`. `undefined`, functions, symbols and circular references are not supported values. A `Date` becomes a JSON string; reconstruct a `Date` in your application if you need one.

## How much fits?

There is no single package-wide quota. Browser policy, browsing mode, data size and available device space affect limits; native storage has its own constraints. `maxSize` can be configured for the memory adapter, but it does not reserve that amount of RAM. Handle write failures and test representative values on each platform.

## Is data encrypted by default?

No. To encrypt a value, configure encryption on the instance and supply an encryption password in the write flow. A per-write `encrypt: true` flag on an instance without enabled encryption does not create an encryptor. Never bundle a fixed password in browser JavaScript. Native Secure storage uses iOS Keychain or Android EncryptedSharedPreferences after Capacitor registration; Strata does not expose a biometric requirement. See the [encryption guide](../guides/features/encryption.md).

## Does one write appear on every device?

No. Browser, iOS and Android adapters store values locally. Browser cross-tab sync can notify another tab about supported changes but does not create a cross-device account or settle concurrent writes. Firebase is an optional integration with separate setup and authentication.

## Can I query wrapper keys or tags?

`query()` tests fields of each decoded value. It does not treat the storage key or Strata wrapper metadata as fields. If a value contains `{ tags: ['work'], score: 80 }`, a supported condition is:

```typescript
const matches = await storage.query({
  tags: { $in: ['work'] },
  score: { $gte: 80 },
});
```

Use `keys('prefix')` or `keys(/^prefix/)` when the key name is what you need to filter.

## How do I migrate existing data?

Follow the [migration guide](../migration.md) for Strata's key prefix and adapter changes. A migration from another library needs its own old-data reader and a tested read/write/read transfer; the guide does not supply one for every library.

## Where do I start?

Install the package, run the [Quick Start](../quick-start.md), then choose an [adapter](../api/adapters/README.md). Native apps should follow [device verification](../guides/platforms/device-verification.md).
