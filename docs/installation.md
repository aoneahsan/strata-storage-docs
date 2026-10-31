---
sidebar_position: 2
description: Install Strata Storage and verify a browser or Capacitor adapter with the package's current entry points.
---

# Installation

Strata Storage 3.1.4 requires Node 24.13 or later in the toolchain and ships as ESM. The core package has no runtime dependencies. Framework, Firebase and Capacitor integrations are optional sub-path imports with their own peer requirements.

## Add the package

```bash
yarn add strata-storage
```

For another package manager, use its normal package-add command. The core browser entry point is `strata-storage`.

## Verify a browser write

```typescript
import { defineStorage } from 'strata-storage';

const storage = defineStorage();
await storage.set('installation-check', 'ready', { storage: 'memory' });
const result = await storage.get<string>('installation-check', {
  storage: 'memory',
});
console.log(result); // ready
```

`defineStorage()` registers the standard web adapters and initializes lazily. The memory check works in a browser page without asking for persistent storage. Then run the [Quick Start](./quick-start.md) with the adapter your app will use.

## Add a framework binding only when needed

The package exports `strata-storage/react`, `strata-storage/vue` and `strata-storage/angular`. Install the corresponding framework peer in your app and follow its [integration example](./examples/README.md). A basic `defineStorage()` call needs no framework Provider or plugin.

## Add Capacitor adapters only in a Capacitor app

Install the optional `@capacitor/core` peer through your app's package manager and sync the native project after installing the package. Register the adapters before selecting a native backend:

```typescript
import { defineStorage } from 'strata-storage';
import { registerCapacitorAdapters } from 'strata-storage/capacitor';

const storage = defineStorage();
await registerCapacitorAdapters(storage);
await storage.set('device-setting', 'ready', { storage: 'preferences' });
const result = await storage.get<string>('device-setting', {
  storage: 'preferences',
});
```

This snippet requires a running Capacitor iOS or Android app. The registration helper returns without adding native adapters in a browser tab. Run the [device verification sequence](./guides/platforms/device-verification.md), including a read after app restart. The Secure adapter uses platform storage but does not expose a biometric prompt option; do not add Face ID usage text solely for this package.

## Optional Firebase integration

Install the `firebase` peer only if your app uses the [Firebase integration](./guides/platforms/firebase.md). Its setup and authentication remain your app's responsibility. The core package does not provide a hosted account or automatic cross-device synchronization.

## Encryption passwords

Do not put an encryption password in a browser `.env` file or compiled config: build tools can embed it in public JavaScript. An encrypted write needs an instance with encryption enabled **and** a password supplied by a user or other appropriate runtime flow. Follow the [encryption guide](./guides/features/encryption.md) for the exact options and recovery implications. A server secret belongs only on the server.

## Troubleshooting

- “No available storage adapters” usually means a manually constructed `new Strata()` instance has no registered adapters. Use `defineStorage()` for the standard browser set, or register the adapter explicitly.
- A native adapter cannot be selected from an ordinary browser page. Check Capacitor registration and the device runtime.
- If an encrypted write throws for a missing password, supply a password through the application flow; do not disable the failure or bundle a fixed one.

See [troubleshooting](./reference/troubleshooting.md) for further error paths.
