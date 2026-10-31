---
title: Session state patterns
description: Store temporary client-side session state with Strata Storage while keeping authentication on the server.
tags: [session, ttl, web]
---

# Session State Patterns

Strata Storage can retain **client-side state** for a browser tab or across reloads. It does not create, validate, revoke, or synchronize a server authentication session. Keep authentication and authorization on the server; issue an `HttpOnly` cookie there if the application needs a browser session credential.

## Tab-Scoped State

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  namespace: 'checkout-draft',
  defaultStorages: ['sessionStorage', 'memory'],
});

await storage.set('step', 2, {
  storage: 'sessionStorage',
  ttl: 1_800_000,
});
const step = await storage.get<number>('step', {
  storage: 'sessionStorage',
});
```

`sessionStorage` survives a reload in the same tab but is tab scoped. If you want state that survives closing the tab, choose `localStorage` or `indexedDB` explicitly and account for the longer retention.

## Sign-Out Cleanup

```typescript
const keys = await storage.keys(/^draft:/, { storage: 'sessionStorage' });
for (const key of keys) {
  await storage.remove(key, { storage: 'sessionStorage' });
}
```

Clear application state on sign-out after the server ends the authentication session. `clear({ storage: 'sessionStorage', prefix: 'draft:' })` is also available when the whole matching set belongs to this instance.

## Native State

A Capacitor app can select `secure` for a sensitive local value after calling `registerCapacitorAdapters(storage)`. The public `StorageOptions` has no biometric prompt or Keychain accessibility option; the [iOS](../platforms/ios.md) and [Android](../platforms/android.md) guides describe the supported boundary. Verify native persistence on device.

## See Also

- [TTL guide](../features/ttl.md)
- [Sync guide](../features/sync.md)
