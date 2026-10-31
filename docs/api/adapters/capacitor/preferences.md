# Preferences Adapter

Store small app settings in native iOS and Android preferences through Capacitor.

## Setup

```typescript
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const storage = defineStorage({ namespace: 'myapp' });
await registerCapacitorAdapters(storage);

await storage.set('theme', 'dark', { storage: 'preferences' });
const theme = await storage.get<string>('theme', { storage: 'preferences' });
```

Call `registerCapacitorAdapters` in a native Capacitor app before the first native storage operation. The registration helper returns without registering native adapters in a browser.

## Configuration

`StrataConfig.adapters.preferences` accepts a boolean. It does not expose an App Group, key prefix, or iCloud sync option. Use the instance `namespace` to separate logical key groups.

```typescript
const storage = defineStorage({
  namespace: 'settings',
  defaultStorages: ['preferences', 'memory'],
  adapters: { preferences: true },
});
await registerCapacitorAdapters(storage);
```

For larger records, use the [SQLite adapter](./sqlite.md) or [Filesystem adapter](./filesystem.md). Use the [Secure adapter](./secure.md) for sensitive values.

## Verification

Native read, write, persistence, and availability still require iOS and Android device checks. See the [device verification guide](../../../guides/platforms/device-verification.md).
