---
sidebar_position: 3
title: Quick Start
description: Install Strata Storage and write, read and remove your first value using the built-in web adapters.
---

# Quick Start

Your first `set()` needs an available adapter. The exported `storage` instance registers the standard web adapters and initialises on first use. You don't construct or initialise it.

<a id="install"></a>
## 📦 Install&nbsp;[#](#install)

```bash
yarn add strata-storage
```

The package is ESM-only and requires [Node 24.13 or later](https://github.com/aoneahsan/strata-storage/blob/main/package.json) in your toolchain. It has no runtime dependencies. React, Vue, Angular, Firebase and Capacitor integrations are optional sub-path imports with their own peer requirements.

<a id="write-and-read-a-value"></a>
## 🛠️ Write and read a value&nbsp;[#](#write-and-read-a-value)

```typescript
import { storage } from 'strata-storage';

await storage.set('draft', { title: 'First pass' });
const draft = await storage.get<{ title: string }>('draft');

console.log(draft?.title); // First pass

await storage.remove('draft');
console.log(await storage.has('draft')); // false
```

The default preference order is `localStorage`, `indexedDB`, `sessionStorage`, then `memory`. The instance also registers `cookies` and `cache`; `keys()`, `clear()` and `size()` without a storage option span all registered adapters. `subscribe()` listens to registered adapters that support change events. The URL adapter is exported but must be registered explicitly. See [storage selection](/configuration#storage-selection) before calling a broad `clear()`.

`get<T>()` returns `T | null` when you supply `T`; without it the result is `unknown | null`. The type parameter describes your data to TypeScript. It does not validate stored data at runtime.

<a id="configure-one-instance-for-your-app"></a>
## ⚙️ Configure one instance for your app&nbsp;[#](#configure-one-instance-for-your-app)

Use `defineStorage()` when you need a different adapter preference or feature set. It registers the standard web adapters and initialises lazily, just like `storage`.

```typescript
import { defineStorage } from 'strata-storage';

export const appStorage = defineStorage({
  defaultStorages: ['indexedDB', 'localStorage', 'memory'],
});

await appStorage.set('theme', 'dark');
const theme = await appStorage.get<string>('theme');
```

`defaultStorages` sets preference order; it does **not** limit which adapters are registered. To exclude an adapter, use `adapters: { <name>: false }` in the configuration. [Configuration](/configuration) explains adapter options and the `strata:` key prefix used by `localStorage` and `sessionStorage` since 3.0.

<a id="choose-a-framework-or-native-guide"></a>
## 📱 Choose a framework or native guide&nbsp;[#](#choose-a-framework-or-native-guide)

The core API works without a provider. For a framework, create an instance with `defineStorage()` and bind it:

- [React](/examples/frameworks/react): bind hooks with `createStrataHooks()`.
- [Vue](/examples/frameworks/vue): bind composables with `createStrataComposables()`.
- [Angular](/examples/frameworks/angular): provide an instance through `provideStrata()`.

On iOS and Android, register the Capacitor adapters, run `yarn cap sync`, and verify reads and writes on a device. A browser test does not exercise Keychain, EncryptedSharedPreferences, SQLite or the native filesystem. Follow the [device verification guide](/guides/platforms/device-verification).

<a id="explore-feature-guides-and-limits"></a>
## 🎛️ Explore feature guides and limits&nbsp;[#](#explore-feature-guides-and-limits)

- [Encryption](/guides/features/encryption) and [compression](/guides/features/compression) are opt-in and use the asynchronous API.
- [Expiry](/api/features/ttl) supports absolute or sliding TTL.
- [Queries](/guides/features/queries) filter stored values; Strata Storage remains client-side key-value storage, not a multi-user database.
- [Key-prefix migration](/configuration#key-prefix) moves qualifying 2.x `localStorage` and `sessionStorage` keys on read, not in a bulk sweep.
- If one browser app only needs `localStorage`, use it directly.

<a id="api-reference"></a>
## ➡️ API reference&nbsp;[#](#api-reference)

Open the [API reference](/api/core/strata) for method and option contracts, or try the [basic usage examples](/examples/basic-usage) for another round-trip.
