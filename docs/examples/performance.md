---
title: Measure storage work
description: Measure Strata Storage reads, writes and local query costs without invented benchmarks or unsupported indexes.
tags: [examples, performance]
---

# Measure storage work

Storage speed depends on the adapter, browser or device, value size and the rest of your application. Measure the round-trip you actually use. The Strata API has no `setMany()` method and no `indexedDB.indexes` configuration.

- [Measure a bounded sample](#measure)
- [Choose the storage path](#path)
- [Query costs](#query)

<a id="measure"></a>
## ⏱️ Measure a bounded sample&nbsp;[#](#measure)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();
const samples = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  title: `Draft ${index}`,
}));

const started = performance.now();
for (const item of samples) {
  await storage.set(`draft:${item.id}`, item, { storage: 'indexedDB' });
}
const writeMilliseconds = performance.now() - started;

const readStarted = performance.now();
const first = await storage.get<{ id: number; title: string }>(
  'draft:0', { storage: 'indexedDB' },
);
const readMilliseconds = performance.now() - readStarted;
```

Run this in each target browser with representative values. `writeMilliseconds` and `readMilliseconds` are measurements from that run, not a package-wide speed claim. Clean up the sample keys when the measurement ends.

<a id="path"></a>
## 🗂️ Choose the storage path&nbsp;[#](#path)

`memory` loses values on reload. `localStorage` writes synchronously in the browser. `indexedDB` is an async browser backend. Set the adapter explicitly when your data's persistence matters:

```typescript
await storage.set('preview', { open: true }, { storage: 'memory' });
await storage.set('draft', { title: 'Working copy' }, {
  storage: 'indexedDB',
});
```

Compression is optional. It only runs when the instance is configured for it, and it may keep a value uncompressed if the output would not be smaller:

```typescript
const compressedStorage = defineStorage({
  compression: { enabled: true, threshold: 1024 },
});
const articleText = 'A representative paragraph. '.repeat(100);
await compressedStorage.set('article', articleText, {
  storage: 'indexedDB',
  compress: true,
});
```

Replace the sample `articleText` with your application's value. Compare a representative write and read with compression on and off before enabling it for a workload.

<a id="query"></a>
## 🔎 Query costs&nbsp;[#](#query)

`storage.query()` scans selected adapter keys and decodes each value before matching. Strata doesn't expose IndexedDB indexes or SQL indexes through its key/value API. Use a server-side query for large or shared datasets; keep local queries bounded and measure them on the target device.
