# LocalStorage Adapter

Persistent browser storage using the localStorage API.

## Overview

The LocalStorage adapter provides simple, synchronous, persistent storage in web browsers. Data persists across browser sessions and page reloads.

### Capabilities

| Feature | Support |
|---------|----------|
| Persistence | ✅ Yes |
| Synchronous | ✅ Yes |
| Observable | ✅ Yes (same origin) |
| Searchable | ✅ Yes |
| Iterable | ✅ Yes |
| Capacity | Varies by browser and available device storage |
| Performance | 🚀 Fast |
| TTL Support | ✅ Yes (manual) |
| Batch Support | ✅ Yes |
| Transaction Support | ❌ No |

## Shared storage areas {#shared-storage-areas}

`localStorage` is shared with every other script on the origin. Since 3.0.0, this adapter prefixes
keys with `strata:` by default. Set `keyPrefix: false` only when another script must read the exact
physical key; older unprefixed keys can migrate on read.

**Since 2.9.0 the adapter identifies its own data by shape**: a key counts as its own only when the
stored value deserializes into a `StorageValue` envelope. Everything else is skipped.

What that means in practice:

- `keys()` returns only keys this library wrote. A key put in `localStorage` by anything else is
  invisible to it **by design**.
- The TTL sweep and `clear()` never read, delete, or log about another application's data.
- A value that is not ours is **not an error** — it is evidence the key belongs to somebody else. It is
  skipped and reported at `debug`. `logger.error` is reserved for a key carrying our own envelope that
  still fails, and for a genuine storage-access fault such as a blocked origin.

```typescript
import { setLogLevel } from 'strata-storage';
setLogLevel('debug');   // names every skipped key and why
```

:::note Before 2.9.0
An empty prefix made the adapter claim every key on the origin. It logged
`Failed to get key <foreign-key> from localStorage: SyntaxError…` on every TTL sweep, returned foreign
keys from `keys()`, and could delete a foreign key whose JSON happened to carry an expired `expires`.
Setting a prefix or a namespace is still good practice for a clean keyspace — it is no longer what keeps
the library off other people's keys.
:::

## Usage

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();

// Explicitly use localStorage
await storage.set('preference', value, { storage: 'localStorage' });
```

## Configuration

```typescript
const storage = defineStorage({
  adapters: {
    localStorage: {
      prefix: 'myapp_'
    }
  }
});
```

### Configuration Options

- `prefix` (string): This adapter's physical-key prefix. The instance-level `keyPrefix` defaults to
  `strata:` and can be set to `false` for a known external reader; an adapter prefix overrides it.
  The adapter still identifies its own stored values by their envelope shape.

## Features

### Cross-Tab Synchronization

```typescript
// Changes are synchronized across tabs
storage.subscribe((change) => {
  if (change.source === 'remote') {
    console.log(`Tab updated ${change.key}`);
  }
}, { storage: 'localStorage' });
```

### Domain Persistence

```typescript
// Data persists for the domain
await storage.set('userData', user, { storage: 'localStorage' });
// Available after browser restart
```

### Synchronous Operations

```typescript
// LocalStorage operations are synchronous under the hood
// But Strata wraps them in promises for consistency
const value = await storage.get('key', { storage: 'localStorage' });
```

## Use Cases

### 1. User Preferences

```typescript
class PreferenceManager {
  async saveTheme(theme: 'light' | 'dark') {
    await storage.set('theme', theme, { 
      storage: 'localStorage' 
    });
  }
  
  async getTheme() {
    return await storage.get<'light' | 'dark'>('theme', { 
      storage: 'localStorage' 
    }) || 'light';
  }
  
  async saveLanguage(lang: string) {
    await storage.set('language', lang, { 
      storage: 'localStorage' 
    });
  }
}
```

### 2. Form Draft Saving

```typescript
// Auto-save form drafts
function setupFormAutosave(formId: string) {
  const form = document.getElementById(formId);
  
  form?.addEventListener('input', async (e) => {
    const formData = new FormData(form as HTMLFormElement);
    const data = Object.fromEntries(formData);
    
    await storage.set(`draft:${formId}`, data, {
      storage: 'localStorage',
      ttl: 604800000 // 7 days
    });
  });
  
  // Restore draft on load
  const draft = await storage.get(`draft:${formId}`, {
    storage: 'localStorage'
  });
  
  if (draft) {
    // Restore form fields
  }
}
```

### 3. Shopping Cart

```typescript
class CartManager {
  private cartKey = 'shopping_cart';
  
  async addItem(item: CartItem) {
    const cart = await this.getCart();
    cart.items.push(item);
    cart.updatedAt = Date.now();
    
    await storage.set(this.cartKey, cart, {
      storage: 'localStorage'
    });
  }
  
  async getCart(): Promise<Cart> {
    const cart = await storage.get<Cart>(this.cartKey, {
      storage: 'localStorage'
    });
    
    return cart || { items: [], updatedAt: Date.now() };
  }
  
  async clearCart() {
    await storage.remove(this.cartKey, {
      storage: 'localStorage'
    });
  }
}
```

### 4. Offline Queue

```typescript
// Queue actions for offline processing
class OfflineQueue {
  async addAction(action: Action) {
    const queue = await this.getQueue();
    queue.push({
      ...action,
      timestamp: Date.now()
    });
    
    await storage.set('offline_queue', queue, {
      storage: 'localStorage'
    });
  }
  
  async processQueue() {
    const queue = await this.getQueue();
    
    for (const action of queue) {
      try {
        await this.processAction(action);
        // Remove processed action
      } catch (error) {
        // Keep in queue for retry
      }
    }
  }
  
  private async getQueue() {
    return await storage.get('offline_queue', {
      storage: 'localStorage'
    }) || [];
  }
}
```

## Storage Limits

Browser storage limits vary by browser, device, origin, private-browsing mode,
and current disk space. Treat a quota error as a possible write outcome; do not
design around a fixed per-browser capacity.

### Handling Quota Errors

```typescript
import { QuotaExceededError } from 'strata-storage';

try {
  await storage.set('data', largeData, { storage: 'localStorage' });
} catch (error) {
  if (error instanceof QuotaExceededError) {
    // Only remove data that your application can recreate.
    await storage.clear({
      storage: 'localStorage',
      prefix: 'cache:',
    });
    await storage.set('data', largeData, { storage: 'localStorage' });
  } else {
    throw error;
  }
}
```

## Cross-Origin Limitations

```typescript
// LocalStorage is bound to origin (protocol + domain + port)
// https://example.com cannot access http://example.com localStorage
// example.com:3000 cannot access example.com:3001 localStorage

// Use a consistent origin or implement cross-origin communication
if (window.location.origin === 'https://app.example.com') {
  await storage.set('data', value, { storage: 'localStorage' });
}
```

## Best Practices

### 1. Use Prefixes

```typescript
// Namespace your keys to avoid conflicts
const storage = defineStorage({
  adapters: {
    localStorage: {
      prefix: 'myapp_v1_'
    }
  }
});
```

### 2. Implement Versioning

```typescript
// Version your storage schema
const STORAGE_VERSION = 2;

async function migrateStorage() {
  const version = await storage.get('_version', { 
    storage: 'localStorage' 
  });
  
  if (!version || version < STORAGE_VERSION) {
    // Run migrations
    if (version === 1) {
      await migrateV1ToV2();
    }
    
    await storage.set('_version', STORAGE_VERSION, { 
      storage: 'localStorage' 
    });
  }
}
```

### 3. Handle Storage Events

```typescript
// Listen for changes from other tabs
window.addEventListener('storage', (e) => {
  if (e.key?.startsWith('myapp_')) {
    console.log('Storage changed:', e.key, e.newValue);
  }
});

// Or use Strata's subscription
const unsubscribe = storage.subscribe((change) => {
  console.log('Change detected:', change);
}, { storage: 'localStorage' });
```

### 4. Compress Large Data

```typescript
import { defineStorage } from 'strata-storage';

const compressedStorage = defineStorage({ compression: { enabled: true } });
await compressedStorage.set('largeData', data, {
  storage: 'localStorage',
  compress: true,
});
```

Compression runs only when the instance has `compression.enabled: true`; a per-write flag alone does not create the compressor. It may leave a value uncompressed when that value would not get smaller.

## Performance Considerations

### 1. Blocking Operations

```typescript
// localStorage is synchronous and can block the main thread
// For large operations, consider batching

const batch = [];
for (let i = 0; i < 1000; i++) {
  batch.push({ key: `item_${i}`, value: data[i] });
}

// Batch write
for (const { key, value } of batch) {
  await storage.set(key, value, { storage: 'localStorage' });
}
```

### 2. JSON Serialization

```typescript
// Avoid storing non-serializable values
const good = {
  name: 'John',
  age: 30,
  tags: ['user', 'active']
};

const bad = {
  date: new Date(), // Loses type
  func: () => {}, // Cannot serialize
  regex: /pattern/ // Loses type
};

// Adapter-level serialize/deserialize callbacks are not part of StrataConfig.
// Convert a custom value to a supported data shape before calling set().
```

## Security Considerations

### 1. No Sensitive Data

Do not store account passwords in any client-side adapter. Browser `localStorage` is readable by scripts on the origin. A Capacitor app can register the native `secure` adapter for a device-held credential, but that is not a server authentication session or a browser fallback.

### 2. XSS Vulnerabilities

```typescript
// Validate data before storing
function sanitizeUserInput(input: string): string {
  // Remove potential XSS vectors
  return input.replace(/<script[^>]*>.*?<\/script>/gi, '');
}

await storage.set('userContent', sanitizeUserInput(content), {
  storage: 'localStorage'
});
```

## Migration and Fallbacks

```typescript
// Fallback chain when localStorage is not available
await storage.set('data', value, {
  storage: ['localStorage', 'sessionStorage', 'memory']
});

// Check availability
if (storage.getAvailableStorageTypes().includes('localStorage')) {
  // Use localStorage
} else {
  // Use alternative
}
```

## Debugging

```typescript
// Debug localStorage contents
const allKeys = await storage.keys(undefined, { storage: 'localStorage' });
for (const key of allKeys) {
  const value = await storage.get(key, { storage: 'localStorage' });
  console.log(key, value);
}

// Get size information
const size = await storage.size(true);
console.log('LocalStorage usage:', size.byStorage?.localStorage);
```

## See Also

- [Storage Adapters Overview](../README.md)
- [SessionStorage Adapter](./sessionstorage.md) - Session-scoped storage
- [IndexedDB Adapter](./indexeddb.md) - Large-scale storage
- [Cross-Tab Sync Guide](../../../guides/features/sync.md)
