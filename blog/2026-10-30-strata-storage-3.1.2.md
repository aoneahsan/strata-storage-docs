---
slug: strata-storage-3-1-2
title: Strata Storage 3.1.2
description: "No API change: the install script is gone, the CLI moved to bin/, and Android SDK fallbacks are 36."
date: 2026-10-30
tags: [release]
---

No API change: the install script is gone, the CLI moved to bin/, and Android SDK fallbacks are 36.

<!-- truncate -->

No JavaScript or API change: `dist/` is equivalent to 3.1.1's.

## Removed

- **The `postinstall` script.** Installing the package no longer runs anything in your project; the setup
  steps it printed (including `npx cap sync` for Capacitor apps) are in the README's Quick Start.

## Changed

- **The `npx strata-storage` CLI moved from `scripts/` to `bin/`.** The command is unchanged.
- **Android:** the fallback `compileSdkVersion` and `targetSdkVersion` (used only when your app does not set
  them) are now 36. Your app's own values still win.
- **Build and gates:** `tsc` + `tsc-alias` replace the custom build script, and `yarn gates` runs typecheck,
  lint, build and a Vitest suite against the built `dist/` (the storage-ownership predicate and the README
  version row).

Full history: [the changelog](/reference/changelog). Install: `yarn add strata-storage@3.1.2`.
