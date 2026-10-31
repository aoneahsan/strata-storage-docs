# User Authentication Example

Strata Storage holds client-side key-value data. It does not authenticate a user, issue a session, or enforce server authorization. The host application must do those jobs. For a browser app, keep the session credential in a server-issued `HttpOnly` cookie; JavaScript and Strata's cookie adapter cannot create one.

## Basic Authentication Flow

The following endpoints belong to the example host application, not to Strata Storage. The server validates credentials, sets or clears its session cookie, and returns only non-secret account data to the browser.

```typescript
import { defineStorage } from 'strata-storage';

const uiStorage = defineStorage({
  namespace: 'account-ui',
  defaultStorages: ['sessionStorage', 'memory'],
});

async function signIn(email: string, password: string) {
  const response = await fetch('/api/session', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Sign-in failed');

  const account = await response.json();
  await uiStorage.set('lastAccountView', account.defaultView, {
    storage: 'sessionStorage',
  });
  return account;
}

async function signOut() {
  const response = await fetch('/api/session', {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Sign-out failed');
  await uiStorage.clear({ storage: 'sessionStorage' });
}
```

The UI preference is a convenience value, not proof that a person is signed in. Read the server session on boot and enforce access on every protected server route.

## Session State

```typescript
async function loadAccount() {
  const response = await fetch('/api/session', {
    credentials: 'include',
  });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Could not load the session');
  return response.json();
}
```

If the application uses Capacitor native storage for a local credential, register the native adapters first and verify the `secure` read path on device. The `secure` adapter is not a server authentication system and does not expose a biometric requirement through `StorageOptions`.

## Security Best Practices

- Make the server the authority for sign-in, sign-out, roles and account deletion.
- Do not store an access or refresh token in `localStorage`, `sessionStorage`, or a JavaScript-written cookie merely because the value can be encrypted.
- Treat Strata values as untrusted input when sending them to a server.
- Clear temporary account UI data after the server confirms sign-out.
- Test expiry and recovery with the host application's real session API.

## See Also

- [Session state patterns](../guides/patterns/sessions.md)
- [Secure adapter](../api/adapters/capacitor/secure.md)
- [Encryption guide](../guides/features/encryption.md)
