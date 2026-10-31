# Capacitor App Examples

A Capacitor app can use the same `set()` and `get()` calls on web, iOS and Android after it registers the native adapters. A browser build exercises the web adapters; native persistence needs device testing.

## Basic Capacitor Setup

```typescript
import { Capacitor } from '@capacitor/core';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const native = Capacitor.isNativePlatform();
const storage = defineStorage({
  namespace: 'my-app',
  defaultStorages: native
    ? ['sqlite', 'preferences', 'memory']
    : ['indexedDB', 'localStorage', 'memory'],
});
if (native) await registerCapacitorAdapters(storage);

await storage.set('draft', { title: 'First pass' });
const draft = await storage.get<{ title: string }>('draft');
```

Create this instance once in the app's startup path and share it with screens. Call `registerCapacitorAdapters()` before the first native operation.

## Platform-Specific Storage

```typescript
if (native) {
  await storage.set('theme', 'dark', { storage: 'preferences' });
  await storage.set('offline-draft', draft, { storage: 'sqlite' });
  await storage.set('device-credential', credential, { storage: 'secure' });
} else {
  await storage.set('theme', 'dark', { storage: 'localStorage' });
  await storage.set('offline-draft', draft, { storage: 'indexedDB' });
}
```

An explicit native storage type is unavailable in a regular browser. Choose a browser fallback for shared code; check native availability and round-trip behavior on both devices.

## Biometric Authentication

Strata's `secure` adapter does not provide a biometric prompt or a `biometricOnly` option. If the host app needs a biometric check, it must choose and verify a separate authentication mechanism. That check is not a guarantee that a value written through Strata remains biometric-gated on later reads.

## App State Persistence

```typescript
import { App } from '@capacitor/app';

const listener = await App.addListener('appStateChange', async ({ isActive }) => {
  if (!isActive) {
    await storage.set('lastPauseAt', Date.now(), {
      storage: native ? 'preferences' : 'localStorage',
    });
  }
});

// Remove the listener when the app shell is disposed.
await listener.remove();
```

Use the [device verification guide](../guides/platforms/device-verification.md) to test restart persistence and each adapter. An app state event is not a substitute for awaiting a write when data must be durable.

## See Also

- [Capacitor platform guide](../guides/platforms/capacitor.md)
- [Native adapter reference](../api/adapters/README.md)
