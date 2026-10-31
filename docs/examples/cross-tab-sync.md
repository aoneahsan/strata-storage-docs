# Cross-tab change examples

Strata can notify another browser tab about a change to a supported shared adapter. A notification helps a view refresh; it does not make two concurrent writes atomic or synchronize an authenticated session.

## Keep a theme view current

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  sync: { enabled: true, storages: ['localStorage'] },
});

async function applySavedTheme(): Promise<void> {
  const theme = await storage.get<'light' | 'dark'>('theme', {
    storage: 'localStorage',
  });
  document.documentElement.dataset.theme = theme ?? 'light';
}

const unsubscribe = storage.subscribe(change => {
  if (change.key === 'theme' && change.source === 'remote') {
    void applySavedTheme();
  }
});

await applySavedTheme();
await storage.set('theme', 'dark', { storage: 'localStorage' });
// Call unsubscribe() when this view is removed.
```

A tab receiving a remote event rereads the value; the event itself is not a durable record. Test two real tabs and a reload in your target browser.

## Authentication boundary

Keep credentials and session validity under your server or identity provider. Do not place an auth token in `localStorage` or broadcast it through Strata. For an existing server-owned session, you may publish a non-secret hint and recheck the server in other tabs:

```typescript
const stopSessionHints = storage.subscribe(change => {
  if (change.key === 'session-check' && change.source === 'remote') {
    void refreshSessionFromServer();
  }
});

await storage.set('session-check', Date.now(), {
  storage: 'localStorage',
});
// Call stopSessionHints() when this view is removed.
```

The hint does not log a tab in or out. Only the server's response determines session state.

## Limits

- Memory is local to one page or process, so it is not a cross-tab transport.
- A subscription must be cleaned up when its owner is removed.
- Multiple tabs changing one value can still race. Use a server-side operation or another coordinated protocol when order and uniqueness matter.
- `StorageOptions` has no per-call `syncEnabled` switch. Configure sync on the instance and choose adapters deliberately.

See the [sync reference](../api/features/sync.md) for the configuration surface.
