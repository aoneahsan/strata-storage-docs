---
title: Vue storage composable
description: Keep a small Vue value in browser storage and clean up the Strata Storage subscription on unmount.
tags: [examples, vue]
---

# Vue storage composable

A Vue composable can wrap one Strata instance for small browser state. This example selects `localStorage`, enables cross-tab sync, restores the value on mount and unsubscribes on unmount. It isn't a server session or a multi-user database.

- [Composable](#composable)
- [Usage and limits](#usage)

<a id="composable"></a>
## 🧩 Composable&nbsp;[#](#composable)

```typescript
import { onMounted, onUnmounted, ref, shallowRef } from 'vue';
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  namespace: 'vue-example',
  defaultStorages: ['localStorage'],
  sync: { enabled: true },
});
const options = { storage: 'localStorage' as const };

export function useStoredValue<T>(key: string, initial: T) {
  const value = shallowRef<T>(initial);
  const ready = ref(false);
  const error = shallowRef<unknown>(null);
  let active = true;
  let unsubscribe: (() => void) | undefined;

  onMounted(async () => {
    unsubscribe = storage.subscribe(change => {
      if (change.key !== key || change.source !== 'remote') return;
      void storage.get<T>(key, options).then(current => {
        if (active) value.value = current ?? initial;
      }).catch(cause => { if (active) error.value = cause; });
    }, options);

    try {
      const stored = await storage.get<T>(key, options);
      if (active && stored !== null) value.value = stored;
    } catch (cause) {
      if (active) error.value = cause;
    } finally {
      if (active) ready.value = true;
    }
  });

  onUnmounted(() => {
    active = false;
    unsubscribe?.();
  });

  async function save(next: T): Promise<void> {
    try {
      await storage.set(key, next, options);
      if (active) value.value = next;
    } catch (cause) {
      error.value = cause;
      throw cause;
    }
  }

  return { value, ready, error, save };
}
```

<a id="usage"></a>
## 🔄 Usage and limits&nbsp;[#](#usage)

Call `useStoredValue('draft-title', '')` from a component's `setup()` and replace the returned `value` through `save()`. `shallowRef` tracks replacement, not deep mutations of an object. Show a pending state until `ready` is true and a retry when `error` is set.

A subscription alone does not enable cross-tab sync; the instance above configures `sync.enabled`. The `localStorage` adapter emits local and remote changes. If you select another adapter, use the public `StorageType` type for its name and verify whether that adapter observes changes. The `indexedDB` adapter currently reports `observable: false`, so this subscription pattern must not be copied onto it unchanged.
