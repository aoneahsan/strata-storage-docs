# Encryption Examples

Strata uses Web Crypto for encrypted values. Create an instance with encryption enabled, then provide a password at the operation or instance level. A plain `defineStorage()` instance does not initialize the encryption manager, even if a later `set()` passes `encrypt: true`.

## Basic Encryption

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({ encryption: { enabled: true } });
const password = await askUserForPassword();

await storage.set('private-draft', { text: 'A draft' }, {
  encryptionPassword: password,
});
const draft = await storage.get<{ text: string }>('private-draft', {
  encryptionPassword: password,
});
```

The password must be available again to decrypt the value. Do not hard-code it or save it beside the encrypted data.

## Global Encryption

```typescript
const storage = defineStorage({
  encryption: { enabled: true, password },
});

await storage.set('private-draft', { text: 'A draft' });
const draft = await storage.get('private-draft');
```

The configured password applies to encrypted operations on that instance. Protect it in the calling application.

## Selective Encryption

```typescript
const storage = defineStorage({ encryption: { enabled: true } });

await storage.set('theme', 'dark', { encrypt: false });
await storage.set('private-draft', draft, {
  encrypt: true,
  encryptionPassword: password,
});

const savedTheme = await storage.get('theme');
const savedDraft = await storage.get('private-draft', {
  encryptionPassword: password,
});
```

When encryption is enabled globally, mark each intentionally plain write with `encrypt: false`.

## Password Management

Use an application-owned unlock step. Do not treat a missing verification value as a successful unlock. For example, create a marker after the user first sets a password, then require that marker on later unlocks:

```typescript
const storage = defineStorage({ encryption: { enabled: true } });

async function createPassword(password: string): Promise<void> {
  await storage.set('_verification', 'ready', { encryptionPassword: password });
}

async function unlock(password: string): Promise<boolean> {
  try {
    return await storage.get<string>('_verification', {
      encryptionPassword: password,
    }) === 'ready';
  } catch {
    return false;
  }
}
```

This checks whether the supplied password decrypts the marker. It is a local example, not an account authentication system.

## Key Derivation

Strata derives an encryption key from the supplied password with PBKDF2. The `encryption` config accepts `iterations`, `saltLength`, `keyLength`, and `algorithm`. It generates a fresh salt for each encrypted write, so the application does not need to hash the password itself.

```typescript
const storage = defineStorage({
  encryption: {
    enabled: true,
    iterations: 600_000,
    saltLength: 16,
    keyLength: 256,
    algorithm: 'AES-GCM',
  },
});
```

## Encrypted File Storage

A `File` is not stored as a live browser object. Convert its bytes to a serializable value before writing, and size it for the chosen adapter's quota:

```typescript
const bytes = new Uint8Array(await file.arrayBuffer());
await storage.set(`file:${file.name}`, Array.from(bytes), {
  storage: 'indexedDB',
  encrypt: true,
  encryptionPassword: password,
});
```

## Secure Form Data

```typescript
async function saveDraft(formId: string, value: unknown, password: string) {
  await storage.set(`form:${formId}`, value, {
    encrypt: true,
    encryptionPassword: password,
    ttl: 3_600_000,
  });
}
```

Keep the password available for a later read, and remove the draft when the user discards it.

## See Also

- [Encryption Guide](../guides/features/encryption.md)
- [Encryption API](../api/features/encryption.md)
