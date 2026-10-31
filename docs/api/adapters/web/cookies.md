# Cookie Adapter

Store small, non-sensitive values in browser cookies.

:::info Shared storage area
The adapter defaults to the `strata_` cookie-name prefix. It lists and clears only values written in Strata's storage envelope. See [key ownership](../../../configuration.md#key-ownership).
:::

## Setup

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage({
  adapters: { cookies: { secure: true, sameSite: 'lax' } },
});

await storage.set('language', 'en', {
  storage: 'cookies',
  ttl: 86_400_000,
});
const language = await storage.get<string>('language', { storage: 'cookies' });
```

`StrataConfig.adapters.cookies` accepts `secure` and `sameSite` (`'strict'`, `'lax'`, or `'none'`). These are instance settings, not options to pass to `set()` or `get()`. Cookie size is limited by the browser; this adapter reports a 4 KB per-cookie limit.

To set a domain or path, create and register a `CookieAdapter` directly:

```typescript
import { Strata, CookieAdapter } from 'strata-storage';

const storage = new Strata({ defaultStorages: ['cookies'] });
storage.registerAdapter(new CookieAdapter('strata_', {
  domain: '.example.com',
  path: '/',
  secure: true,
  sameSite: 'lax',
}));
await storage.initialize();
```

Cookies written by JavaScript cannot be `HttpOnly`, so do not store session secrets with this adapter. If a server needs an `HttpOnly` session cookie, it must send the `Set-Cookie` header itself.

## See also

- [Storage adapters](../README.md)
- [Configuration](../../../configuration.md)
