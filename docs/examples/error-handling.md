---
title: Handle storage errors
description: Handle failed Strata Storage writes and reads using the public error classes and explicit fallback behavior.
tags: [examples, errors]
---

# Handle storage errors

`get()` returns `null` when a key is absent. A storage operation can still reject because the adapter is unavailable, the value is invalid, quota is exhausted or an encrypted value cannot be read. Catch the operation where your UI can show a retry or recovery path.

- [Handle a failed write](#write)
- [Try persistent adapters in order](#fallback)
- [Encryption failures](#encryption)

<a id="write"></a>
## ⚠️ Handle a failed write&nbsp;[#](#write)

```typescript
import {
  defineStorage,
  QuotaExceededError,
  ValidationError,
} from 'strata-storage';

const storage = defineStorage();

async function saveDraft(title: string): Promise<'saved' | 'retry'> {
  try {
    await storage.set('draft', { title }, { storage: 'indexedDB' });
    return 'saved';
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      // Offer a way to free space or export the draft.
      return 'retry';
    }
    if (error instanceof ValidationError) {
      // Fix the invalid key or value at the call site.
      throw error;
    }
    throw error;
  }
}
```

A `null` read isn't a write error, and a failed write shouldn't be presented as saved. Store a draft in memory only if losing it on reload is acceptable.

<a id="fallback"></a>
## 🗂️ Try persistent adapters in order&nbsp;[#](#fallback)

The `storage` option can list adapters by availability, but a write failure after selection is not a promise to retry the next backend. To handle write failures, attempt each adapter yourself:

```typescript
import type { StorageType } from 'strata-storage';

async function saveWithFallback(value: string): Promise<StorageType> {
  const choices: StorageType[] = ['indexedDB', 'localStorage'];
  for (const adapter of choices) {
    try {
      await storage.set('draft', value, { storage: adapter });
      return adapter;
    } catch {
      // Try the next persistent adapter.
    }
  }
  throw new Error('The draft could not be saved in this browser.');
}
```

Record the returned adapter if later reads must target the same place. A browser may deny both paths.

<a id="encryption"></a>
## 🔐 Encryption failures&nbsp;[#](#encryption)

An encrypted read needs the same user-supplied password used for the write. Configure encryption on the instance before using `encrypt: true`; see the [encryption guide](../guides/features/encryption.md). `EncryptionError` lets you offer a password retry without treating the value as absent.

There is no `StrataConfig.onError` callback and no `NotFoundError` for a missing key. Attach error reporting in your own catch block, and avoid logging the value or password.
