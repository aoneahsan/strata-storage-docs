# Compression API

Automatic data compression to reduce storage size and optimize performance.

## Overview

Strata Storage includes built-in compression using a pure JavaScript implementation of the LZ-string algorithm. This reduces storage footprint for large objects while maintaining fast performance.

## Configuration

### Global Compression

Enable compression for all data:

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  compression: {
    enabled: true,
    threshold: 1024 // Only compress data larger than 1KB
  }
});

// All large objects are now automatically compressed
await storage.set('largeData', bigObject);
```

### Per-Operation Compression

Compress specific values:

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ compression: { enabled: true } });

// Skip compression for a specific value.
await storage.set('small', 'value', { compress: false });

// Allow compression for a specific value when it reduces size.
await storage.set('large', bigObject, {
  compress: true
});
```

The per-operation flag controls a configured compressor. `compress: true` on an instance without `compression.enabled: true` does not initialize one.

## API Reference

### CompressionConfig

Configuration options for compression:

```typescript
interface CompressionConfig {
  enabled?: boolean; // Enable/disable compression
  threshold?: number; // Minimum size in bytes to compress (default: 1024)
  algorithm?: 'lz'; // Compression algorithm (only the bundled zero-dependency LZ codec is implemented)
}
```

### SetOptions.compress

Per-operation compression flag:

```typescript
interface SetOptions {
  compress?: boolean; // Override global compression setting
  // ... other options
}
```

## Methods

### Automatic Compression/Decompression

Compression and decompression happen automatically:

```typescript
// Data is compressed when stored
await storage.set('data', largeObject, { compress: true });

// Data is decompressed when retrieved
const data = await storage.get('data'); // Returns original object
```

### Manual Compression

Use the exported `CompressionManager` class directly. Its `compress`/`decompress`
methods are async; `compress()` returns a `CompressedData` object, or the original
value when it is below the threshold or would not get smaller:

```typescript
import { CompressionManager } from 'strata-storage';

const manager = new CompressionManager({ threshold: 1024 });
const data = 'Large string data...'.repeat(1000);

// Compress -> CompressedData | original value
const compressed = await manager.compress(data);

if (manager.isCompressedData(compressed)) {
  console.log(`Original: ${compressed.originalSize} bytes`);
  console.log(`Compressed: ${compressed.compressedSize} bytes`);

  // Decompress -> original value
  const decompressed = await manager.decompress(compressed);
  console.log(decompressed === data); // true
}
```

### Inspect Compression Results

`CompressionManager` reports whether a value compressed and by how much:

```typescript
import { CompressionManager } from 'strata-storage';

const manager = new CompressionManager({ threshold: 1024 });
const result = await manager.compress(largeObject);

if (manager.isCompressedData(result)) {
  console.log(result.originalSize); // Size before compression (bytes)
  console.log(result.compressedSize); // Size after compression (bytes)
  console.log(manager.getCompressionRatio(result)); // e.g. 0.3
  console.log(manager.getSavingsPercentage(result)); // e.g. 70
}
```

## Examples

### Basic Compression

```typescript
const storage = defineStorage({
  compression: {
    enabled: true,
    threshold: 1024 // Compress data > 1KB
  }
});

// Small data - not compressed
await storage.set('small', 'Hello'); // 5 bytes, not compressed

// Large data - compressed
await storage.set('large', 'x'.repeat(2000), {
  compress: true
}); // 2000 bytes, compressed
```

### Selective Compression

```typescript
const storage = defineStorage({ compression: { enabled: true } });

// Skip a small value deliberately.
await storage.set('config', { theme: 'dark', lang: 'en' }, { compress: false });

// Ask the configured compressor to examine larger values.
await storage.set('article', longArticleText, { compress: true });
await storage.set('logs', largeLogArray, { compress: true });
```

The compressor may keep an input uncompressed when compression would not reduce its size.

### Compression with Encryption

Compression runs before encryption when both are configured. Supply the
password at runtime from your application's authentication or a user-entered
secret; do not embed it in a browser bundle or store it beside the encrypted
value.

```typescript
function createPrivateStorage(encryptionPassword: string) {
  return defineStorage({
    compression: { enabled: true, threshold: 512 },
    encryption: { enabled: true, password: encryptionPassword },
  });
}
```

### Choosing a Threshold

The threshold is chosen when the storage instance is created. Test
representative values on your target devices and set a threshold that avoids
compressing small writes. `navigator.storage.estimate()` reports an origin's
estimated storage budget; it does not establish a reliable `localStorage`
capacity or an ideal compression threshold.

### Compression Measurement

Measure a representative value with the exported manager. This reports the
codec's result for that sample; it is not a measurement of the complete
adapter write or of every value stored by an instance.

```typescript
import { CompressionManager } from 'strata-storage';

const sample = { entries: Array.from({ length: 100 }, () => 'repeated text') };
const compressor = new CompressionManager({ threshold: 1024 });
const start = performance.now();
const result = await compressor.compress(sample);
const elapsedMs = performance.now() - start;

if (compressor.isCompressedData(result)) {
  console.log({
    originalBytes: result.originalSize,
    compressedBytes: result.compressedSize,
    elapsedMs,
  });
} else {
  console.log({ compressed: false, elapsedMs });
}
```

## Performance Considerations

### When to Use Compression

**✅ Good compression candidates:**
- Text content (articles, logs, JSON strings)
- Repetitive data
- Large arrays with similar items
- Base64-encoded data

**❌ Poor compression candidates:**
- Already compressed data (images, videos)
- Encrypted data (no patterns to compress)
- Very small data (<1KB overhead not worth it)
- Highly random data

### Compression Impact

Compression ratio and time depend on the input and device. Measure with your
actual values on the platforms you support. Repetitive text often compresses
well; already-compressed images and random bytes often do not. The bundled
compressor does not promise a fixed reduction or latency.

## Best Practices

### 1. Set Appropriate Threshold

Set a threshold for the value sizes you actually write. A very low threshold
spends time checking small values even when the compressor decides to leave
them unchanged.

```typescript
const storage = defineStorage({
  compression: { enabled: true, threshold: 1024 }
});
```

### 2. Combine with Right Storage Adapter

```typescript
// Skip compression when the value is already small enough for your use case.
await storage.set('largeData', data, {
  storage: 'indexedDB',
  compress: false
});

// Compression can reduce repetitive values before a browser storage write.
await storage.set('largeData', data, {
  storage: 'localStorage',
  compress: true
});
```

### 3. Don't Compress Already Compressed Data

```typescript
// ❌ BAD - Double compression
const imageBase64 = '...'; // Already compressed
await storage.set('image', imageBase64, { compress: true });

// ✅ GOOD - Skip compression
await storage.set('image', imageBase64, { compress: false });
```

## Error Handling

```typescript
import { CompressionError } from 'strata-storage';

try {
  await storage.set('data', largeData, { compress: true });
} catch (error) {
  if (error instanceof CompressionError) {
    console.error('Compression failed:', error.message);
    // Fallback: Store without compression
    await storage.set('data', largeData, { compress: false });
  }
}
```

## See Also

- [Encryption API](./encryption.md)
- [TTL API](./ttl.md)
- [Storage Adapters](../adapters/README.md)
