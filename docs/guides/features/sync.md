---
title: Cross-tab sync
description: Enable Strata Storage change notifications across browser tabs and handle remote updates.
tags: [sync, web]
---

# Cross-Tab Sync Guide

Strata Storage can notify another browser tab when a value changes. `BroadcastChannel` is the primary path. The browser's `storage` event is a `localStorage` fallback; `sessionStorage` does not cross tabs through that event.

## Quick Start

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  defaultStorages: ['localStorage', 'memory'],
  sync: { enabled: true, storages: ['localStorage'] },
});

const unsubscribe = storage.subscribe((change) => {
  if (change.source === 'remote' && change.key === 'draft') {
    // Reload this key into your own UI state.
  }
});

await storage.set('draft', { title: 'First draft' }, {
  storage: 'localStorage',
});

// When the screen or app shell is removed:
unsubscribe();
```

The receiving tab should read the key again when it gets a remote notification. A notification is not an atomic merge of two simultaneous writes.

## Configuration

```typescript
const storage = defineStorage({
  sync: {
    enabled: true,
    storages: ['localStorage', 'indexedDB'],
    conflictResolution: 'latest',
  },
});
```

`sync` accepts `enabled`, `storages`, `interval` and `conflictResolution` (`'latest'`, `'merge'`, or a callback). There is no per-call `syncEnabled` option or top-level `onLog` hook. If a key must stay local, put it in a storage type outside the configured sync list or use a separate instance.

## Limits

- `sessionStorage` is tab scoped; do not use it as a cross-tab fallback.
- A storage event on `localStorage` is raised by writes in another tab, not the current one.
- Native iOS and Android storage behavior needs device verification; this browser guide does not prove cross-device sync.

## See Also

- [Sync API reference](../../api/features/sync.md)
- [Web platform guide](../platforms/web.md)
