---
slug: strata-storage-3-0-0
title: Strata Storage 3.0.0
description: "The web adapters now prefix their keys with strata:, with automatic migration of existing data."
date: 2026-09-01
tags: [release]
---

The web adapters now prefix their keys with strata:, with automatic migration of existing data.

<!-- truncate -->

**Breaking: the web adapters now prefix their keys with `strata:`.** One line restores the old behaviour,
and existing data migrates itself on read — but read the migration notes before upgrading, because a
consumer that reads a physical key from outside this library must opt out.

## Breaking

- **`localStorage` and `sessionStorage` keys are now written under `strata:`.** `DEFAULT_WEB_KEY_PREFIX`
  is exported. Before this release the default prefix was the empty string, so this library's keys sat
  unprefixed among every other script's on the origin. 2.9.0 made that *safe* — a key is ours only if its
  value is a `StorageValue` envelope — and this makes it *tidy*, so our keys are identifiable by name too.
  - `cookies` are unchanged: they already defaulted to `strata_`, and moving them would break existing
    cookies for no gain.
  - `indexedDB` and `cache` own a named store, `memory` owns its own Map, and the URL adapter already
    prefixes its params. None of them can collide with another script's keys, so none of them change.
  - `namespace` is a separate mechanism and is unaffected. The physical key is
    `<keyPrefix><namespace>:<key>`.

## Added

- **`keyPrefix`** — set `false` (or `''`) for the pre-3.0 behaviour, or a string for your own prefix. A
  per-adapter `adapters.localStorage.prefix` still wins over it.
- **`migrateLegacyKeys`** (default `true`) — adopt pre-3.0 unprefixed entries on read.

## Migration

**Most consumers need to do nothing.** On a miss at `strata:<key>`, the adapter looks for the bare `<key>`
and, if the value is one of ours, moves it under the prefix and returns it. Your data stays reachable.

Three properties of that migration, each verified in a browser:

- **It is per key, on read — never a bulk sweep.** A sweep would adopt every unprefixed envelope on the
  origin, including keys belonging to an instance that opted out or to a sibling app still on 2.x.
- **It never adopts a value that is not ours** — the 2.9.0 envelope check is what makes it safe at all.
  A planted `_cltk` is left exactly where it is.
- **It never overwrites.** A value already at the prefixed key wins and the legacy entry is left alone.

🔴 **Take `keyPrefix: false` if anything outside this library reads a physical key directly** — a
pre-paint theme script that runs before any module loads, or a logger reading its own level. Those
readers know the exact key name, and a prefix changes it underneath them. Migration keeps the *data*
reachable through this library; it cannot fix a hard-coded reader.

```typescript
// Frozen physical key names, or an external reader — keep 2.x behaviour:
export const storage = defineStorage({ keyPrefix: false });
```

🔴 **Two applications sharing one origin, one still on 2.x:** set `migrateLegacyKeys: false` on the
upgraded one, so it does not move keys the other still reads. Better, give each app a `namespace` —
they were already colliding before this release.

## Fixed

- **A live timer no longer keeps a Node process alive.** `setInterval` holds the event loop open, so a
  short-lived script — a build step, a CLI, an SSR warmup — that created an instance never exited unless
  it also called `close()`. Measured: a script doing one `set`/`get` hung until killed at 120s, and now
  exits immediately. All three timers (adapter TTL, cross-adapter cleanup, auto-backup) are `unref`'d;
  it is a no-op in browsers.

Full history: [the changelog](/reference/changelog). Install: `yarn add strata-storage@3.0.0`.
