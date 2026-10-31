---
title: Sync a local outbox
description: Queue browser writes with Strata Storage and replay them to an idempotent server endpoint.
tags: [examples, sync]
---

# Sync a local outbox

Strata Storage can hold pending writes. It doesn't supply a server, conflict policy or delivery guarantee. Your backend must validate the request, authorize the user and treat a repeated operation ID as the same write.

- [Queue and replay](#outbox)
- [Recovery boundaries](#boundaries)

<a id="outbox"></a>
## 🔄 Queue and replay&nbsp;[#](#outbox)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ namespace: 'draft-sync' });

type PendingDraft = {
  id: string;
  draftId: string;
  title: string;
};

async function queueDraft(draftId: string, title: string): Promise<string> {
  const id = crypto.randomUUID();
  const pending: PendingDraft = { id, draftId, title };
  await storage.set(`outbox:${id}`, pending, { storage: 'indexedDB' });
  return id;
}

async function replayDrafts(): Promise<void> {
  const keys = await storage.keys(/^outbox:/, { storage: 'indexedDB' });

  for (const key of keys) {
    const pending = await storage.get<PendingDraft>(key, {
      storage: 'indexedDB',
    });
    if (!pending) continue;

    try {
      const response = await fetch('/api/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': pending.id,
        },
        body: JSON.stringify({
          draftId: pending.draftId,
          title: pending.title,
        }),
      });
      if (!response.ok) continue;
      await storage.remove(key, { storage: 'indexedDB' });
    } catch {
      // Keep this write for the next retry.
    }
  }
}
```

`/api/drafts` stands for your own authenticated endpoint. It must deduplicate `Idempotency-Key` and return 2xx only after it has accepted the write; a 4xx/5xx response leaves the local record queued. Call `replayDrafts()` on startup, resume and a possible reconnection. An `online` event is a hint, not proof that the request will succeed.

<a id="boundaries"></a>
## ⚠️ Recovery boundaries&nbsp;[#](#boundaries)

Each operation has its own storage key, so replay doesn't replace a whole queue and erase writes added during the loop. Two tabs can still replay the same key, and a crash can happen after server success but before local removal. Server idempotency handles both cases. For concurrent edits of the same draft, define a revision and conflict policy on the server; this example does not resolve them.

`query()` matches decoded value fields, not physical key names or `value.*` paths. Use `keys(/^outbox:/, { storage: 'indexedDB' })` to find the outbox, and keep account tokens in your server-owned session rather than this client store.
