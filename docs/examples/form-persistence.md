---
title: Persist a form draft
description: Save, restore and discard a small form draft with Strata Storage without promising an upload or submission.
tags: [examples, forms]
---

# Persist a form draft

A local draft can restore small text fields after a reload. It doesn't submit the form or save files on a server. Keep passwords, payment details and other sensitive fields out of browser draft storage.

- [Draft operations](#draft)
- [Schedule a save](#schedule)
- [Recovery boundary](#boundary)

<a id="draft"></a>
## 📝 Draft operations&nbsp;[#](#draft)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ namespace: 'profile-form' });
const draftOptions = { storage: 'localStorage' as const };

type Fields = { displayName: string; bio: string };
type Draft = { fields: Fields; updatedAt: number };

async function saveDraft(fields: Fields): Promise<void> {
  await storage.set('draft', {
    fields,
    updatedAt: Date.now(),
  } satisfies Draft, draftOptions);
}

async function loadDraft(): Promise<Draft | null> {
  return storage.get<Draft>('draft', draftOptions);
}

async function discardDraft(): Promise<void> {
  await storage.remove('draft', draftOptions);
}
```

Call `loadDraft()` before filling the form fields. `null` means there is no saved draft. Await `saveDraft()` before telling the user that the draft is saved.

<a id="schedule"></a>
## ⏱️ Schedule a save&nbsp;[#](#schedule)

```typescript
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let writes: Promise<void> = Promise.resolve();

function scheduleDraftSave(
  fields: Fields,
  onFailure: (error: unknown) => void,
): void {
  clearTimeout(saveTimer);
  const snapshot = { ...fields };
  saveTimer = setTimeout(() => {
    writes = writes.then(() => saveDraft(snapshot)).catch(onFailure);
  }, 500);
}

function stopDraftAutoSave(): void {
  clearTimeout(saveTimer);
}
```

Call `scheduleDraftSave()` after a field changes and `stopDraftAutoSave()` when the form view closes. The queued Promise serializes writes so an older save doesn't finish after a newer one. A write can still fail; keep the form visible and show a retry instead of claiming success.

<a id="boundary"></a>
## ⚠️ Recovery boundary&nbsp;[#](#boundary)

`localStorage` quota and availability vary by browser. Test restore after reload and after a failed write. Form submission is confirmed by your server, and a file upload needs its own server-issued upload ID and retry protocol; a stored progress percentage cannot resume bytes by itself.
