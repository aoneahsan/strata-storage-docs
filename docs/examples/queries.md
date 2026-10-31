---
title: Query stored values
description: Query decoded Strata Storage values with supported operators and result options.
tags: [examples, query]
---

# Query stored values

Strata Storage's `query()` reads values from the selected adapter and matches fields on the decoded value. It doesn't query storage keys, wrapper metadata or database indexes.

- [A browser round-trip](#round-trip)
- [Operators and result options](#operators)
- [Limits](#limits)

<a id="round-trip"></a>
## 🔎 A browser round-trip&nbsp;[#](#round-trip)

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();
await storage.set('member:1', {
  name: 'Sam', status: 'active', age: 27, tags: ['team'],
}, { storage: 'memory' });
await storage.set('member:2', {
  name: 'Lee', status: 'paused', age: 19, tags: ['trial'],
}, { storage: 'memory' });

const active = await storage.query<{
  name: string;
  status: string;
  age: number;
  tags: string[];
}>({ status: 'active' }, { storage: 'memory' });
// active contains { key: 'member:1', value: { ... } }
```

The object passed to `query()` names value fields directly. Use `status`, not `value.status`; the returned `key` is outside the value and isn't a condition field.

<a id="operators"></a>
## 🧭 Operators and result options&nbsp;[#](#operators)

```typescript
const adultsInTeam = await storage.query<{
  name: string;
  status: string;
  age: number;
  tags: string[];
}>({
  age: { $gte: 18 },
  tags: { $in: ['team'] },
}, {
  storage: 'memory',
  sort: { age: -1 },
  skip: 0,
  limit: 10,
});
```

Supported comparisons include `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$regex`, `$exists` and `$type`. `$and`, `$or` and `$not` combine conditions. `$in` matches an array field when any listed operand appears in that array; it doesn't inspect Strata's wrapper tags.

`sort`, `skip` and `limit` shape the returned array after matching. `select` projects value fields. The result remains an array of `{ key, value }` records.

<a id="limits"></a>
## ⚠️ Limits&nbsp;[#](#limits)

`query()` scans selected adapter keys and decodes their values. The `indexedDB` and `sqlite` adapters don't expose database indexes through `StrataConfig`. For large or shared datasets, query and aggregate on your server; this client-side API is for bounded local data.
