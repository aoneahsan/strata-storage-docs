# Secure Storage Adapter

Store sensitive values through Strata Storage's native secure adapter in a Capacitor app.

## Setup

```typescript
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const storage = defineStorage();
await registerCapacitorAdapters(storage);

await storage.set('session_token', token, {
  storage: 'secure',
  ttl: 3_600_000,
});
const savedToken = await storage.get<string>('session_token', { storage: 'secure' });
await storage.remove('session_token', { storage: 'secure' });
```

Call `registerCapacitorAdapters` before the first native operation. It registers no native adapter when running in a browser.

## Configuration and limits

`StrataConfig.adapters.secure` accepts a boolean. Per-operation `StorageOptions` supports `storage`, `ttl`, `encrypt`, and other common Strata options. It does **not** expose Keychain accessibility, a biometric requirement, or an authentication prompt. Do not rely on this adapter for a biometric confirmation flow.

Treat the stored values as credentials: keep keys scoped to the application, use a short TTL where appropriate, and remove them at sign-out. Native behavior and persistence need iOS and Android device verification; see the [device verification guide](../../../guides/platforms/device-verification.md).

## See also

- [Capacitor platform guide](../../../guides/platforms/capacitor.md)
- [Encryption guide](../../../guides/features/encryption.md)
