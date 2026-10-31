# Advanced Encryption Examples

Strata's encryption manager runs only when the instance has `encryption.enabled: true`. `encrypt: true` on an instance without that configuration does not turn encryption on. These examples use the async API and a password supplied by the calling application.

## Basic Encryption

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ encryption: { enabled: true } });
const password = await askUserForPassword();

await storage.set('private-draft', { text: 'First draft' }, {
  encryptionPassword: password,
});
const draft = await storage.get<{ text: string }>('private-draft', {
  encryptionPassword: password,
});
```

Do not put a real password in source code or persist it beside the ciphertext.

## Configuration Options

```typescript
const storage = defineStorage({
  encryption: {
    enabled: true,
    algorithm: 'AES-GCM',
    keyLength: 256,
    iterations: 600_000,
    saltLength: 16,
  },
});
```

The package generates a fresh salt and IV for each encrypted write. `keySize` and a literal `salt` are not configuration options. Keep the same user password for later reads; each record carries the salt and iteration count needed for decryption.

## Platform-Specific Encryption

Web Crypto encryption works through the configured Strata instance. A Capacitor app can instead use the native `secure` adapter after registration:

```typescript
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const storage = defineStorage();
await registerCapacitorAdapters(storage);
await storage.set('session_token', token, { storage: 'secure' });
```

Native behavior needs iOS and Android device verification. This API does not expose a biometric prompt or a per-call Keychain accessibility setting.

## Selective Encryption

```typescript
const storage = defineStorage({ encryption: { enabled: true } });

await storage.set('theme', 'dark', { encrypt: false });
await storage.set('private-draft', draft, {
  encrypt: true,
  encryptionPassword: password,
});
```

A configured instance defaults to encryption for each write, so an intentionally plain value needs `encrypt: false`.

## Key Management

A password must be supplied again to read an encrypted value. If the application loses it, Strata cannot decrypt that value. Let the account or user flow own password recovery; the package does not provide an escrow service.

```typescript
try {
  const draft = await storage.get('private-draft', {
    encryptionPassword: password,
  });
  // Use draft only after the read succeeds.
} catch {
  // Show a local recovery path without logging the password or value.
}
```

## Real-World Examples

For a private draft, choose a storage backend with enough space and a useful expiry:

```typescript
await storage.set('draft:123', draft, {
  storage: 'indexedDB',
  encrypt: true,
  encryptionPassword: password,
  ttl: 86_400_000,
});
```

Do not store a card number or a server authentication secret merely because a local encryption option exists. Keep those flows with the service that owns them.

## Best Practices

- Enable encryption on the instance before the first encrypted write.
- Use the async API; synchronous reads and writes cannot encrypt or decrypt.
- Supply and protect the password outside the package.
- Verify a write-read round-trip on every intended platform.
- Use the native `secure` adapter for device-held credentials only after testing its native path.

## See Also

- [Encryption guide](../../guides/features/encryption.md)
- [Encryption API](../../api/features/encryption.md)
- [Basic encryption examples](../encryption.md)
