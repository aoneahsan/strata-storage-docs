---
title: Queue consented analytics events
description: Keep a bounded local analytics outbox with Strata Storage and send it to your own validated endpoint.
tags: [examples, analytics]
---

# Queue consented analytics events

Strata Storage is a local key/value layer, not an analytics provider. You can use it to hold a small event outbox until your own endpoint accepts the events. Collect only after the user has given the consent your product requires, and keep sensitive values out of event properties.

- [Record an event](#record)
- [Replay the outbox](#replay)
- [Query and clear local records](#query)

<a id="record"></a>
## 📝 Record an event&nbsp;[#](#record)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ namespace: 'analytics-example' });

type PageEvent = {
  id: string;
  name: 'page_view';
  path: string;
  occurredAt: number;
};

async function trackPageView(hasConsent: boolean): Promise<void> {
  if (!hasConsent) return;

  const event: PageEvent = {
    id: crypto.randomUUID(),
    name: 'page_view',
    path: window.location.pathname,
    occurredAt: Date.now(),
  };
  await storage.set(`event:${event.id}`, event, {
    storage: 'indexedDB',
    ttl: 7 * 24 * 60 * 60 * 1000,
  });
}
```

The event stores a path, not the full URL with query parameters. The 7-day TTL bounds the local queue; an event that expires before delivery is lost. Choose retention from your product's privacy policy and operational needs.

<a id="replay"></a>
## 📤 Replay the outbox&nbsp;[#](#replay)

```typescript
async function sendPendingEvents(): Promise<void> {
  const keys = await storage.keys(/^event:/, { storage: 'indexedDB' });

  for (const key of keys) {
    const event = await storage.get<PageEvent>(key, { storage: 'indexedDB' });
    if (!event) continue;

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': event.id,
        },
        body: JSON.stringify(event),
      });
      if (response.ok) await storage.remove(key, { storage: 'indexedDB' });
    } catch {
      // Keep the event for a later attempt.
    }
  }
}
```

`/api/analytics` is your own endpoint. It must validate the event, enforce consent and deduplicate the operation ID before accepting it. A failed HTTP status leaves the event queued. Aggregate counts and charts on the server; a client-side scan of local events cannot represent all users.

<a id="query"></a>
## 🔎 Query and clear local records&nbsp;[#](#query)

```typescript
const docsViews = await storage.query<PageEvent>({
  name: 'page_view',
  path: '/docs',
}, { storage: 'indexedDB' });

// When consent is withdrawn, stop tracking and clear this local outbox.
await storage.clear({ storage: 'indexedDB', prefix: 'event:' });
```

`query()` matches `name` and `path` because both fields are in the stored value. The result is this browser's local records only. If your app sends events to other providers too, consent withdrawal must cover those paths as well.
