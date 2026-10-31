---
title: Angular storage service
description: Wrap the supported Strata Storage API in an Angular service for local drafts and subscriptions.
tags: [examples, angular]
---

# Angular storage service

An Angular service can own one Strata instance and expose the operations your components need. This example keeps small drafts in browser `localStorage`, whose adapter emits change events. It doesn't implement authentication or a shared server database.

- [Draft service](#service)
- [Subscriptions and limits](#subscriptions)

<a id="service"></a>
## 🧩 Draft service&nbsp;[#](#service)

```typescript
import { Injectable } from '@angular/core';
import { defineStorage, type StorageChange } from 'strata-storage';

type Draft = {
  title: string;
  status: 'open' | 'closed';
};

@Injectable({ providedIn: 'root' })
export class DraftStorageService {
  private readonly storage = defineStorage({
    namespace: 'angular-drafts',
    defaultStorages: ['localStorage'],
  });

  async save(id: string, draft: Draft): Promise<void> {
    await this.storage.set(`draft:${id}`, draft, { storage: 'localStorage' });
  }

  async load(id: string): Promise<Draft | null> {
    return this.storage.get<Draft>(`draft:${id}`, { storage: 'localStorage' });
  }

  async remove(id: string): Promise<void> {
    await this.storage.remove(`draft:${id}`, { storage: 'localStorage' });
  }

  async listOpen(): Promise<Array<{ key: string; value: Draft }>> {
    return this.storage.query<Draft>({ status: 'open' }, {
      storage: 'localStorage',
    });
  }

  subscribe(onChange: (change: StorageChange) => void): () => void {
    return this.storage.subscribe(change => {
      if (change.key.startsWith('draft:')) onChange(change);
    }, { storage: 'localStorage' });
  }
}
```

Inject `DraftStorageService` into a component, call its async methods and show a pending or failure state around writes. `load()` returns `null` for a missing draft. The service uses only public methods; it never reaches into a private `.storage` field from another class.

<a id="subscriptions"></a>
## 🔄 Subscriptions and limits&nbsp;[#](#subscriptions)

`subscribe()` returns an unsubscribe function. A component that registers a callback should call it when the component is destroyed. The `localStorage` adapter emits local writes and browser storage events from other tabs. The `indexedDB` adapter does not advertise change observation, so don't move this subscription to IndexedDB and assume it will fire.

`query()` scans decoded local values. Keep the namespace dedicated to drafts, or add a value field to distinguish records. For large datasets, let your server query and aggregate the records.
