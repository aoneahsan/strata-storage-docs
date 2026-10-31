# Troubleshooting

Common issues and solutions when using Strata Storage.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Runtime Errors](#runtime-errors)
- [Platform-Specific Issues](#platform-specific-issues)
- [Performance Issues](#performance-issues)
- [Data Persistence Issues](#data-persistence-issues)
- [TypeScript Issues](#typescript-issues)

## Installation Issues

### Package Not Found

**Problem**: `npm install strata-storage` fails with package not found error.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install strata-storage

# Or use specific version
npm install strata-storage@latest
```

### Peer Dependency Warnings

**Problem**: Warnings about missing peer dependencies.

**Solution**: Peer dependencies are optional. Install only what you need:

```bash
# For React projects
npm install react

# For Vue projects
npm install vue

# For Angular projects
npm install @angular/core

# For Capacitor projects
npm install @capacitor/core
```

### Build Errors During Installation

**Problem**: Native module build errors on iOS/Android.

**Solution**:
```bash
# iOS: Update CocoaPods
cd ios && pod update && cd ..

# Android: Clean gradle cache
cd android && ./gradlew clean && cd ..

# Sync Capacitor
npx cap sync
```

## Runtime Errors

### "Storage not initialized"

**Problem**: A manually constructed `Strata` instance has no registered adapters, or the requested adapter is unavailable.

**Solution**: Use `defineStorage()` for the standard web adapters. It initializes lazily:

```typescript
import { defineStorage } from 'strata-storage';
const storage = defineStorage();

await storage.set('key', 'value');
```

### "Failed to get key … is not valid JSON" in the console

**Symptom.** On every page load, one or more of:

```
[strata-storage] Failed to get key _cltk from sessionStorage: SyntaxError: Unexpected token 's', "ts3hsf" is not valid JSON
[strata-storage] Failed to get key logger-level from localStorage: SyntaxError: Unexpected token 'w', "warn" is not valid JSON
```

**Fixed in 2.9.0 — upgrade.** `yarn up strata-storage` (or `npm i strata-storage@latest`). No code change
and no migration: your keys stay exactly where they are.

**What was happening.** `localStorage` and `sessionStorage` are shared with every other script on the
origin, and the web adapters' key prefix was empty before 3.0.0 — so the adapter's name test matched every
key on the origin, including third-party ones. It then parsed each as JSON and reported the failure at
`error` level. `_cltk` is Microsoft Clarity's session key; the trigger is usually an analytics tag, not
your code. Consumers routing their logger into Sentry received one report per foreign key per sweep.

Two further consequences, both closed by the same fix: `keys()` returned keys the library never wrote,
and the TTL sweep could **delete** a foreign key whose JSON happened to carry an expired `expires`.

**After 2.9.0** an adapter treats a key as its own only when the stored value is a `StorageValue`
envelope. Foreign keys are skipped silently — a value that is not ours is evidence the key belongs to
somebody else, not an error. To see what is being skipped:

```typescript
import { setLogLevel } from 'strata-storage';
setLogLevel('debug');
// [strata-storage] sessionStorage: skipping key "_cltk" — value is not readable as
// sessionStorage data (not written by this adapter).
```

**If you cannot upgrade yet**, raise the log level's floor so `error` output is suppressed
(`setLogLevel('silent')` — note this silences real errors too), or construct `Strata` directly and
register only the adapters you use. Neither is needed on 2.9.0.

### "Operation 'subscribe' is not supported by indexedDB adapter"

**Symptom.** `storage.subscribe(cb)` with no options throws, often taking application boot with it:

```
NotSupportedError: Operation 'subscribe' is not supported by indexedDB adapter
```

**Fixed in 2.9.0 — upgrade.** The unscoped form fanned out across every registered adapter, and
`indexedDB`, `cookies` and `cache` cannot emit change events — so the documented "hear every adapter"
form failed on any default instance. Non-observable backends are now skipped, and you get an observer
attached to the ones that can speak.

**Workaround before 2.9.0** (still valid, and tighter when you only care about one backend):

```typescript
storage.subscribe(cb, { storage: 'localStorage' });
```

### QuotaExceededError

**Problem**: Browser storage quota exceeded.

**Solution**:

```typescript
import { QuotaExceededError } from 'strata-storage';

try {
  await storage.set('data', largeData);
} catch (error) {
  if (error instanceof QuotaExceededError) {
    // Option 1: Clear old data
    await storage.clear();

    // Option 2: Use compression
    await storage.set('data', largeData, { compress: true });

    // Option 3: Switch to IndexedDB
    await storage.set('data', largeData, { storage: 'indexedDB' });
  }
}
```

### EncryptionError

**Problem**: Encryption/decryption fails.

**Solution**:

```typescript
// Ensure encryption is properly configured
const storage = defineStorage({
  encryption: {
    enabled: true,
    password: 'your-password' // Use consistent password
  }
});

// Don't change password after storing encrypted data
// or you won't be able to decrypt it
```

### StorageNotAvailableError

**Problem**: Requested storage adapter not available.

**Solution**:

```typescript
// Check available storage types first
const storage = defineStorage();

const available = storage.getAvailableStorageTypes();
console.log('Available:', available);

// Use available storage type
if (available.includes('indexedDB')) {
  await storage.set('key', 'value', { storage: 'indexedDB' });
} else {
  // Fallback to default
  await storage.set('key', 'value');
}
```

## Platform-Specific Issues

### Web Browser Issues

#### Private/Incognito Mode

**Problem**: Storage not working in private browsing mode.

**Solution**: Use memory adapter as fallback:

```typescript
const storage = defineStorage({
  defaultStorage: 'memory' // Works in all modes
});
```

#### Safari localStorage Disabled

**Problem**: localStorage disabled in Safari privacy settings.

**Solution**: Automatic fallback is built-in, or configure manually:

```typescript
const storage = defineStorage({
  defaultStorages: ['indexedDB', 'memory'] // Skip localStorage
});
```

#### Cross-Origin Issues

**Problem**: Cannot access storage from different origin.

**Solution**: Storage is origin-specific by design. Use postMessage for cross-origin:

```typescript
// In iframe
window.parent.postMessage({ key: 'value' }, '*');

// In parent
window.addEventListener('message', (event) => {
  await storage.set(event.data.key, event.data.value);
});
```

### iOS Issues

#### Keychain Access Denied

**Problem**: Cannot access Keychain storage on iOS.

**Solution**: Add usage description to `Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>This app uses secure storage to protect your data</string>
```

#### Data Lost After App Update

**Problem**: Data disappears after updating app.

**Solution**: Don't use `.tmp` or `.cache` directories:

```typescript
// Use UserDefaults or Keychain for persistent data
await storage.set('key', 'value', { storage: 'preferences' });
```

#### SQLite Permission Denied

**Problem**: Cannot create/access SQLite database.

**Solution**: Ensure using correct directory:

```typescript
// Use documents directory, not tmp
await storage.set('key', 'value', { storage: 'sqlite' });
```

### Android Issues

#### SharedPreferences Encryption Fails

**Problem**: EncryptedSharedPreferences throws error.

**Solution**: Requires Android 6.0+ (API 23):

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.getPlatform() === 'android') {
  // Check Android version
  const version = await Capacitor.getAndroidVersion();
  if (version >= 23) {
    await storage.set('key', 'value', { storage: 'secure' });
  } else {
    // Fallback for older Android
    await storage.set('key', 'value', { encrypt: true });
  }
}
```

#### SQLite Database Locked

**Problem**: Database is locked error.

**Solution**: Ensure proper connection management:

```typescript
// Don't open multiple connections
const storage = defineStorage(); // Reuse instance

// Use throughout app
await storage.set('key', 'value');
```

## Performance Issues

### Slow Writes

**Problem**: Writing data is slow.

**Solution**:

```typescript
// Start independent writes together
await Promise.all([
  storage.set('key1', 'value1'),
  storage.set('key2', 'value2'),
  storage.set('key3', 'value3')
]);

// Disable compression for small data
await storage.set('small', 'value', { compress: false });

// Use faster storage adapter
await storage.set('key', 'value', { storage: 'memory' });
```

### Slow Reads

**Problem**: Reading data is slow.

**Solution**:

```typescript
// Use memory caching
const storage = defineStorage({
  cache: {
    enabled: true,
    maxSize: 100 // Cache 100 items
  }
});

// Read multiple keys at once
const values = await Promise.all(
  ['key1', 'key2', 'key3'].map((key) => storage.get(key))
);
```

### High Memory Usage

**Problem**: App uses too much memory.

**Solution**:

```typescript
// Limit cache size
const storage = defineStorage({
  cache: {
    enabled: true,
    maxSize: 50 // Smaller cache
  }
});

// Don't store large objects in memory adapter
// Use IndexedDB or SQLite instead
await storage.set('large', bigData, { storage: 'indexedDB' });

// Clear memory periodically
await storage.clear({ storage: 'memory' });
```

## Data Persistence Issues

### Data Not Persisting

**Problem**: Data disappears after page reload.

**Solution**:

```typescript
// Don't use sessionStorage or memory for persistent data
await storage.set('key', 'value', {
  storage: 'localStorage' // Persists across sessions
});

// Or use default (picks best persistent storage)
await storage.set('key', 'value');
```

### Data Lost After Browser Update

**Problem**: Browser update clears storage.

**Solution**: Use multiple storage locations:

```typescript
// Store in both localStorage and IndexedDB
await storage.set('important', value, { storage: 'localStorage' });
await storage.set('important', value, { storage: 'indexedDB' });

// Implement backup
async function backupData() {
  const keys = await storage.keys(undefined, { storage: 'indexedDB' });
  const data = Object.fromEntries(await Promise.all(
    keys.map(async (key) => [key, await storage.get(key, { storage: 'indexedDB' })])
  ));
  return data; // Encrypt and transfer through your own authenticated backup API.
}
```

### TTL Not Expiring Data

**Problem**: Data not automatically removed after TTL.

**Solution**: Ensure TTL cleanup is enabled:

```typescript
const storage = defineStorage({
  ttl: {
    autoCleanup: true,
    cleanupInterval: 60000 // Check every minute
  }
});

// Verify TTL is set correctly
await storage.set('temp', 'value', {
  ttl: 5000 // 5 seconds
});

// Wait and check
setTimeout(async () => {
  const value = await storage.get('temp'); // Should be null
  console.log(value);
}, 6000);
```

## TypeScript Issues

### Type Errors

**Problem**: TypeScript type errors.

**Solution**:

```typescript
// Use generic types
interface User {
  id: number;
  name: string;
}

const storage = defineStorage();

// Type-safe operations
await storage.set<User>('user', { id: 1, name: 'John' });
const user = await storage.get<User>('user');

// user is typed as User | null
if (user) {
  console.log(user.name); // Type-safe
}
```

### Missing Type Definitions

**Problem**: Import errors or missing types.

**Solution**:

```typescript
// Ensure types are imported correctly
import { defineStorage, type StrataConfig } from 'strata-storage';

// Or use namespace imports
import * as StrataStorage from 'strata-storage';
const storage = StrataStorage.defineStorage();
```

### Framework Integration Types

**Problem**: Type errors in React/Vue/Angular.

**Solution**:

```typescript
// React
import { useStrata } from 'strata-storage/react';

function MyComponent() {
  const { data, loading, error } = useStrata<string>('key');
  // data is typed as string | null
}

// Vue
import { useStrata } from 'strata-storage/vue';

interface MyData {
  value: string;
}

const { data, loading } = useStrata<MyData>('key');
// data is Ref<MyData | null>
```

## Still Having Issues?

If you're still experiencing problems:

1. **Check the FAQ**: [FAQ](./faq.md)
2. **Browse the docs**: [Documentation](https://stratastorage-docs.aoneahsan.com)
3. **Enable Debug Mode**:
   ```typescript
   const storage = defineStorage({
     debug: { enabled: true, logOperations: true }
   });
   ```
4. **Contact us**: [Report an issue](https://stratastorage.aoneahsan.com/contact)

When creating an issue, please include:
- Strata Storage version
- Platform (web/iOS/Android)
- Browser/OS version
- Minimal reproduction code
- Error messages and stack traces
- What you've tried so far

## Getting Help

- **Contact / report an issue**: [stratastorage.aoneahsan.com/contact](https://stratastorage.aoneahsan.com/contact)
- **Documentation**: [stratastorage-docs.aoneahsan.com](https://stratastorage-docs.aoneahsan.com)
- **Email**: aoneahsan@gmail.com
