# Web platform guide

Strata Storage's browser adapters give one key/value API over several browser storage facilities. The adapter you choose still determines persistence, quota and availability.

## Start with a browser-ready instance

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
});

await storage.set('draft', { title: 'First pass' });
const draft = await storage.get<{ title: string }>('draft');
```

`defineStorage()` registers memory, localStorage, sessionStorage, IndexedDB, cookies and the Cache adapter. It initializes lazily. With no explicit `storage` option, Strata tries your `defaultStorages` in order and uses the first available registered adapter; it does not measure and choose the fastest backend.

To select a backend deliberately:

```typescript
await storage.set('setting', 'dark', { storage: 'localStorage' });
await storage.set('temporary', 'editing', { storage: 'memory' });
await storage.set('draft', { title: 'First pass' }, {
  storage: ['indexedDB', 'localStorage'],
});
```

Web storage availability and quota depend on the browser, storage settings, browsing mode and device. Test each target browser and a reload round-trip. See the [adapter map](../../api/adapters/README.md) for what each adapter stores.

## Cross-tab changes

```typescript
const sharedStorage = defineStorage({ sync: { enabled: true } });
const unsubscribe = sharedStorage.subscribe(change => {
  if (change.source === 'remote') {
    // Refresh the affected view from storage.
  }
});

// Call unsubscribe() when this view is removed.
```

Cross-tab notifications do not make a write atomic across tabs. Use a server or a coordinated protocol for operations that must not be duplicated.

## Service workers

The Strata Cache adapter requires `window` and is for JSON-serializable key/value data in browser pages. It is not the browser's request/response cache interface inside a service worker. Use the browser Cache API for an app shell or HTTP responses in that scope:

```javascript
// In a service worker
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open('app-shell-v1');
    await cache.add('/index.html');
  })());
});
```

Choose a cache version and update policy for your app. The sample only shows installation and does not provide an offline fallback or an update flow.

## Quota and persistent storage

```typescript
if (navigator.storage?.estimate) {
  const estimate = await navigator.storage.estimate();
  // Inspect estimate.usage and estimate.quota for this browser.
}
```

`navigator.storage.persist()` is a browser permission request, not a guarantee that IndexedDB or Cache data survives every user action. Handle write failures and keep a recovery path for data that matters.

For an application outbox, see the [offline support example](../../examples/offline-support.md). The server must deduplicate replayed operations.
