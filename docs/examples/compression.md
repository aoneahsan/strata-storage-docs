# Compression Examples

Strata's bundled LZ codec runs when the instance has `compression.enabled: true`. A `compress: true` option on an unconfigured instance does not initialize the compressor.

## Basic Compression

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ compression: { enabled: true } });
await storage.set('large-dataset', largeData, { compress: true });
const restored = await storage.get('large-dataset');
```

Compression and decompression use the async API.

## Automatic Compression

```typescript
const storage = defineStorage({
  compression: {
    enabled: true,
    threshold: 1024,
    algorithm: 'lz',
  },
});

await storage.set('user-list', largeUserArray);
await storage.set('small-config', { theme: 'dark' });
```

The configured threshold decides whether the data is large enough to compress. Compression may not reduce every value's size.

## Selective Compression

```typescript
const storage = defineStorage({ compression: { enabled: true } });

await storage.set('api-response', jsonData, { compress: true });
await storage.set('small-config', { theme: 'dark' }, { compress: false });
```

To combine compression and encryption, enable both features on the instance and supply an encryption password. Strata compresses before encrypting:

```typescript
const storage = defineStorage({
  compression: { enabled: true },
  encryption: { enabled: true },
});

await storage.set('private-draft', draft, {
  compress: true,
  encrypt: true,
  encryptionPassword: password,
});
```

## Compression Stats

`CompressionManager.compress()` returns compression output for the value you pass it; it does not report a database-wide saved-byte total. Measure a representative input and the actual stored payload if your application needs a size comparison.

## Conditional Compression

```typescript
const storage = defineStorage({ compression: { enabled: true } });
const shouldCompress = JSON.stringify(value).length >= 1024;
await storage.set('result', value, { compress: shouldCompress });
```

## Bulk Compression

Rewriting all existing keys changes their stored representation and expiry metadata. Migrate a bounded, known key set only after testing a read-write-read round-trip and any TTL requirements.

## See Also

- [Compression guide](../guides/features/compression.md)
- [Configuration](./configuration.md)
