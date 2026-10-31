# Storage adapters

Strata Storage presents the same key/value operations to different storage backends. The selected adapter determines where values live and which platform can read them.

## Adapter map

| Adapter | Where it runs | What it stores | Setup |
|---|---|---|---|
| [Memory](./web/memory.md) | JavaScript runtime | Temporary values, cleared on reload | Included in the default web set |
| [LocalStorage](./web/localstorage.md) | Browser page | Persistent values for one origin | Included in the default web set |
| [SessionStorage](./web/sessionstorage.md) | Browser page | Values for one tab session | Included in the default web set |
| [IndexedDB](./web/indexeddb.md) | Browser page | Persistent key/value data | Included in the default web set |
| [Cookies](./web/cookies.md) | Browser page | Small values in browser cookies | Included in the default web set |
| [Cache](./web/cache.md) | Browser page | JSON-serializable key/value data backed by the Cache API | Included in the default web set |
| [URL](./web/url.md) | Browser page | Small, shareable UI state in a query or hash | Register `URLAdapter` explicitly |
| [Preferences](./capacitor/preferences.md) | Capacitor iOS/Android | Native app preferences | Register Capacitor adapters |
| [Secure](./capacitor/secure.md) | Capacitor iOS/Android | Values through Keychain or EncryptedSharedPreferences | Register Capacitor adapters |
| [SQLite](./capacitor/sqlite.md) | Capacitor iOS/Android | Native SQLite-backed key/value data | Register Capacitor adapters |
| [Filesystem](./capacitor/filesystem.md) | Capacitor iOS/Android | One JSON file per key | Register Capacitor adapters |

Browser quota, native storage limits and latency vary by browser, device, data size and operation. The table does not promise a capacity or benchmark. Test the read path on every platform you ship; [device verification](../../guides/platforms/device-verification.md) remains required for native adapters.

## Choose an adapter

`defineStorage()` registers the standard browser set and initializes on first operation. Without an explicit `storage` option, Strata tries the configured `defaultStorages` in order and uses the first available registered adapter. It does not rank adapters by speed, reliability or capacity.

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
});

await storage.set('draft', { title: 'Working copy' });
const draft = await storage.get<{ title: string }>('draft');
```

To target a specific adapter, supply its name. A fallback list is tried in your chosen order:

```typescript
await storage.set('draft', { title: 'Working copy' }, { storage: 'indexedDB' });
await storage.set('session-note', 'editing', {
  storage: ['sessionStorage', 'memory'],
});
```

Register native adapters before selecting `preferences`, `secure`, `sqlite` or `filesystem`:

```typescript
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const nativeStorage = defineStorage();
await registerCapacitorAdapters(nativeStorage);
await nativeStorage.set('device-setting', 'on', { storage: 'preferences' });
```

The native example needs a Capacitor runtime and device verification. The Secure adapter uses platform facilities, but Strata's public options do not request biometric authentication or promise hardware-backed keys. Do not treat a browser test as proof of native behaviour.

## Capability boundary

The Strata API exposes key/value operations. Its IndexedDB and SQLite adapters use their underlying storage systems, but Strata does not expose native database transactions, indexes or raw SQL through `storage`. Use a platform API directly when you need those features. The Cache adapter stores serializable values, not `Request`/`Response` objects or service worker request caches; use the browser Cache API directly for those tasks.

`storage.getCapabilities(name)` reports an adapter's declared capabilities after it is registered. Capability flags describe the adapter interface; they do not replace a runtime availability check or a read/write/read test.

For custom adapter implementation and registration, follow the [custom adapters guide](../../guides/advanced/custom-adapters.md). For optional Firebase adapters, follow the [Firebase guide](../../guides/platforms/firebase.md) and select them explicitly after setup.
