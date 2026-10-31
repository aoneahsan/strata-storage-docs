# Configuration Examples

Use `defineStorage()` for a web-ready instance. It registers the standard web adapters and initializes on the first operation.

## Basic Configuration

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  namespace: 'my-app',
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
  debug: { enabled: true, verbosity: 'normal' },
});

await storage.set('theme', 'dark');
```

## Full Configuration

```typescript
const storage = defineStorage({
  namespace: 'my-app',
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
  adapters: {
    indexedDB: { dbName: 'MyAppDB', version: 1 },
    localStorage: { prefix: 'myapp:' },
  },
  compression: { enabled: true, threshold: 1024, algorithm: 'lz' },
  ttl: { cleanupInterval: 60_000, defaultTTL: 3_600_000 },
  sync: { enabled: true, storages: ['localStorage', 'indexedDB'], conflictResolution: 'latest' },
  debug: { enabled: true, verbosity: 'normal' },
});
```

`debug` takes an object. `StrataConfig` has no `onLog` callback. Compression currently supports the bundled `'lz'` algorithm.

## Environment-Based Configuration

```typescript
const isDevelopment = import.meta.env.DEV;
const storage = defineStorage({
  namespace: isDevelopment ? 'app-dev' : 'app',
  defaultStorages: isDevelopment
    ? ['memory', 'localStorage']
    : ['indexedDB', 'localStorage', 'memory'],
  debug: { enabled: isDevelopment },
});
```

Keep encryption passwords outside source code and configuration files. Pass a user-provided password to the operation when encryption is needed:

```typescript
const encryptedStorage = defineStorage({ encryption: { enabled: true } });
await encryptedStorage.set('private-draft', draft, {
  encrypt: true,
  encryptionPassword: password,
});
```

## Platform-Specific Configuration

```typescript
import { Capacitor } from '@capacitor/core';
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const native = Capacitor.isNativePlatform();
const storage = defineStorage({
  namespace: 'cross-platform-app',
  defaultStorages: native
    ? ['sqlite', 'preferences', 'memory']
    : ['indexedDB', 'localStorage', 'memory'],
});
if (native) await registerCapacitorAdapters(storage);
```

Native adapters are registered separately. `adapters.sqlite` accepts `filename`; its low-level `SqliteAdapter` constructor accepts `database` and `table` for separate stores. `adapters.secure` and `adapters.preferences` accept booleans, not biometric, iCloud, or App Group options.

## Feature Flags Configuration

```typescript
const storage = defineStorage({
  compression: enableCompression ? { enabled: true, threshold: 1024 } : undefined,
  ttl: enableExpiry ? { defaultTTL: 3_600_000 } : undefined,
});
```

## Multi-Instance Configuration

```typescript
const userStorage = defineStorage({ namespace: 'user-data' });
const cacheStorage = defineStorage({
  namespace: 'cache',
  defaultStorages: ['memory', 'localStorage'],
  ttl: { defaultTTL: 300_000 },
});
```

Namespaces isolate logical keys. They do not create separate IndexedDB object stores or SQLite tables.

## See Also

- [Configuration Guide](../configuration.md)
- [API Reference](../api/core/strata.md)
- [Web Platform Guide](../guides/platforms/web.md)
