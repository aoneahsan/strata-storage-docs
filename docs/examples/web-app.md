# Web Application Examples

These examples use Strata Storage for client-side key-value state. The server still owns authentication, payments and shared records.

## Single Page Application (SPA)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  namespace: 'my-web-app',
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
});

await storage.set('draft:123', { title: 'First pass' }, {
  storage: 'indexedDB',
});
const draft = await storage.get<{ title: string }>('draft:123', {
  storage: 'indexedDB',
});
```

Keep access decisions on the server. A locally stored value does not prove the user is signed in.

## Progressive Web App (PWA)

The current Strata Cache adapter requires a browser `window`, so it is not available inside a service worker. Use the browser Cache API directly in the worker for request/response caching, and Strata in the page for application data.

```typescript
// In the page, not the service worker:
const storage = defineStorage({ namespace: 'pwa-drafts' });
await storage.set('draft', draft, { storage: 'indexedDB' });
```

## Offline-First App

```typescript
async function loadDraft(id: string) {
  const cached = await storage.get(`draft:${id}`, {
    storage: 'indexedDB',
  });
  if (!navigator.onLine) return cached;

  const response = await fetch(`/api/drafts/${encodeURIComponent(id)}`);
  if (!response.ok) return cached;
  const current = await response.json();
  await storage.set(`draft:${id}`, current, { storage: 'indexedDB' });
  return current;
}
```

This is a cached read. Offline writes need an application-owned outbox, stable operation IDs and server idempotency; caching a draft alone does not sync it later.

## Multi-Page Application

```typescript
const storage = defineStorage({ namespace: 'site-preferences' });
await storage.set('theme', 'dark', { storage: 'localStorage' });
```

Pages on the same origin can read the preference through the same namespace. The `strata:` physical prefix is applied by default to shared web storage areas.

## E-Commerce Example

A cart draft can live locally until the shopper signs in or checks out:

```typescript
const storage = defineStorage({ namespace: 'cart-draft' });
await storage.set('items', cartItems, { storage: 'localStorage' });
```

The server must recalculate price, inventory, discounts and payment state. Never take a local cart total as the amount to charge.

## Dashboard Application

```typescript
const storage = defineStorage({
  namespace: 'dashboard-ui',
  sync: { enabled: true, storages: ['localStorage'] },
});

await storage.set('layout', layout, { storage: 'localStorage' });
```

`sync` is an instance configuration, not an option on an individual `set()` call. The server remains the source of truth for dashboard data shared among users.

## Performance Optimization

Use Strata for data, not executable JavaScript. Load modules through the browser's normal import path and cache only serializable results when that is useful:

```typescript
const module = await import('./report-view.js');
const result = module.calculate(reportInput);
await storage.set('report-summary', result, {
  storage: 'indexedDB',
  ttl: 300_000,
});
```

## See Also

- [Capacitor example](./capacitor-app.md)
- [Web platform guide](../guides/platforms/web.md)
- [Session state patterns](../guides/patterns/sessions.md)
