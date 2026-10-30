---
slug: strata-storage-3-1-0
title: Strata Storage 3.1.0
description: "importRawSync adopts one foreign localStorage or sessionStorage entry; sessionStorage keys are prefixed again (ISSUE-13)."
date: 2026-09-24
tags: [release]
---

importRawSync adopts one foreign localStorage or sessionStorage entry; sessionStorage keys are prefixed again (ISSUE-13).

<!-- truncate -->

## Added

- **`importRawSync(rawKey, key, options)`** — adopt ONE foreign `localStorage` / `sessionStorage` entry,
  named by its exact physical key, into a strata key, deleting the original. The migration path for data
  written by something other than this library (a pre-strata zustand store, a raw `setItem`), which the
  implicit paths deliberately never adopt. The raw string is kept as-is; an existing value at `key` wins and
  nothing is moved. Found while moving ZTools' 22 zustand stores onto strata.

## Fixed

- **`sessionStorage` keys were not prefixed** (ISSUE-13). 3.0.0 documented both web areas as written under
  `strata:`, but `SessionStorageAdapter`'s constructor defaulted its prefix to `''`, overriding the shared
  default. It now uses `DEFAULT_WEB_KEY_PREFIX`; existing bare envelope keys migrate themselves on read.

Full history: [the changelog](/reference/changelog). Install: `yarn add strata-storage@3.1.0`.
