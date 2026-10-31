# Offline support examples

Strata can keep a local draft while the network is unavailable. Sending that draft to a server is an application protocol: the server must accept an idempotency key and return a successful HTTP status before the client removes its queued write.

## A bounded write outbox

This browser example keeps each queued write under its own IndexedDB key. Adding a new write during a replay does not overwrite the current queue. Replace `/api/notes` with your own endpoint, and make the server treat repeated `Idempotency-Key` values as the same operation.

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();

type PendingNote = {
  id: string;
  title: string;
};

async function queueNote(title: string): Promise<string> {
  const id = crypto.randomUUID();
  await storage.set(`outbox:${id}`, { id, title } satisfies PendingNote, {
    storage: 'indexedDB',
  });
  return id;
}

async function replayNotes(): Promise<void> {
  const keys = await storage.keys(/^outbox:/, { storage: 'indexedDB' });

  for (const key of keys) {
    const note = await storage.get<PendingNote>(key, { storage: 'indexedDB' });
    if (!note) continue;

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': note.id,
        },
        body: JSON.stringify({ title: note.title }),
      });
      if (!response.ok) continue;
      await storage.remove(key, { storage: 'indexedDB' });
    } catch {
      // Keep the write for a later retry after a network error.
    }
  }
}

window.addEventListener('online', () => { void replayNotes(); });
```

Call `replayNotes()` on app startup and on resume too. The `online` event only signals a possible connection; a request can still fail. A server that does not deduplicate `Idempotency-Key` can create duplicate notes after a retry, so do not use this pattern without that server contract. Multi-tab writers also need coordination if the same queued key can replay in two tabs at once.

## Service worker response cache

A service worker can cache HTTP responses through the browser Cache API. Strata's Cache adapter requires `window` and does not run in a service worker.

```javascript
// In a service worker, for same-origin GET requests you choose to cache.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' ||
      new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open('app-responses-v1');
    const cached = await cache.match(event.request);
    if (cached) return cached;

    const response = await fetch(event.request);
    if (response.ok) await cache.put(event.request, response.clone());
    return response;
  })());
});
```

Choose cacheable routes deliberately. A cached response can be stale, and this example has no eviction policy. For Strata data, use an adapter appropriate to the browser page and test the read path after reload.
