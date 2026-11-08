---
title: Moving from @capacitor-community/sqlite to Strata Storage
sidebar_label: From @capacitor-community/sqlite
description: When a Capacitor SQLite database is really a key-value table, how to copy it into Strata Storage's sqlite adapter, and when to keep SQL.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from @capacitor-community/sqlite

Most apps using this plugin should keep it. It gives you SQL, joins, SQLCipher and an Electron target, and Strata's `sqlite` adapter gives you none of those: you can't write SQL against it. This guide is for the case where your database turned out to be one key-value table.

## SQL statements and their key-value stand-ins

| @capacitor-community/sqlite | Strata Storage |
|---|---|
| `db.run('INSERT OR REPLACE ...', [key, value])` | `storage.set(key, value, { storage: 'sqlite' })` |
| `db.query('SELECT value ... WHERE key = ?', [key])` | `storage.get(key, { storage: 'sqlite' })` |
| `db.run('DELETE ... WHERE key = ?', [key])` | `storage.remove(key, { storage: 'sqlite' })` |
| `db.query('SELECT key ...')` | `storage.keys(undefined, { storage: 'sqlite' })` |
| `db.query('SELECT ... WHERE field = ?')` | `storage.query({ field }, { storage: 'sqlite' })`, a scan of every value |

## Copy the table

This assumes a table named `kv` with `key` and `value` text columns holding JSON. Change the SQL to match yours.

```ts
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

export const storage = defineStorage();

export async function moveKeyValueTable(): Promise<void> {
  await registerCapacitorAdapters(storage);
  if (await storage.get<boolean>('moved:sqlite', { storage: 'sqlite' })) return;
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  const db = await sqlite.createConnection('app', false, 'no-encryption', 1, false);
  await db.open();
  const { values = [] } = await db.query('SELECT key, value FROM kv');
  for (const row of values as { key: string; value: string }[]) {
    await storage.set(row.key, JSON.parse(row.value), { storage: 'sqlite' });
  }
  await sqlite.closeConnection('app', false);
  await storage.set('moved:sqlite', true, { storage: 'sqlite' });
}
```

Strata writes to its own database, `strata_storage` unless you configure another, so the old file stays untouched until you delete it. If the old database is encrypted with SQLCipher, open it with the matching mode and passphrase, and decide how the values are protected on the other side first: Strata's [encryption](../guides/features/encryption.md) isn't SQLCipher. See the [sqlite adapter](../api/adapters/capacitor/sqlite.md) for what it stores.

Read a moved key on [each device](../guides/platforms/device-verification.md) before you remove the plugin.

## The plugin's pages, briefly

We checked the plugin's pages and npm entry on 7 Nov 2026. For the capabilities we compare, they state one thing: it depends on jeep-sqlite. The web stores, the URL, the Keychain, Android secure storage, native preferences and a shared web-and-native API aren't discussed, so the table shows only that row. Read them as unanswered, not as "no". [Check @capacitor-community/sqlite yourself](https://github.com/capacitor-community/sqlite), or open the [side-by-side page](https://stratastorage.aoneahsan.com/compare/capacitor-community-sqlite).

| Store or capability | @capacitor-community/sqlite | Strata Storage |
|---|---|---|
| No runtime dependencies | No. Depends on jeep-sqlite ([source](https://registry.npmjs.org/@capacitor-community/sqlite/latest), 7 Nov 2026) | Yes |

| Package fact | @capacitor-community/sqlite | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/@capacitor-community/sqlite/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 8.1.1 | 3.1.4 |
| Bundle size | 2,680 bytes gzipped, 13,852 minified, version 8.1.1, 7 Nov 2026. JavaScript side only; the native code is not counted by bundlephobia ([source](https://bundlephobia.com/api/size?package=@capacitor-community/sqlite)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 249,947, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/@capacitor-community/sqlite)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
