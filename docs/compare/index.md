---
title: Moving to Strata Storage
sidebar_label: Overview
description: Step-by-step guides for moving to Strata Storage from localForage, Dexie.js, @capacitor/preferences and nine other storage libraries, with dated facts.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving to Strata Storage

Each guide below maps a library's calls to `storage.set()` and friends, shows how to copy the data you already have, and says when you shouldn't move at all. Several of these libraries are the better choice for a narrower job.

All of them follow the same order: install Strata beside the old library, copy once behind a flag, read real keys back, then remove the old library in a later release so a rollback still finds its data.

| Library | What it is | Last checked |
|---|---|---|
| [localForage](./localforage.md) | An async key-value store for browsers that writes to IndexedDB or WebSQL and falls back to localStorage, with a localStorage-shaped API. | 7 Nov 2026 |
| [idb-keyval](./idb-keyval.md) | A very small promise-based key-value store on top of IndexedDB, with get, set, del and a few batch helpers. | 7 Nov 2026 |
| [Dexie.js](./dexie.md) | A wrapper library for IndexedDB with a schema, queries and bulk operations, plus an optional paid sync service called Dexie Cloud. | 7 Nov 2026 |
| [store2](./store2.md) | A small wrapper over localStorage and sessionStorage that adds JSON handling, namespaces and a page-lifetime area. | 7 Nov 2026 |
| [@capacitor/preferences](./capacitor-preferences.md) | The official Capacitor plugin for a small string key-value store, backed by UserDefaults on iOS, SharedPreferences on Android and localStorage on the web. | 7 Nov 2026 |
| [capacitor-secure-storage-plugin](./capacitor-secure-storage-plugin.md) | A community Capacitor plugin for storing string secrets in the iOS Keychain and Android Keystore-backed SharedPreferences. | 7 Nov 2026 |
| [@aparajita/capacitor-secure-storage](./aparajita-capacitor-secure-storage.md) | A Capacitor 8 plugin for secure key-value storage of JSON data in the iOS Keychain (with optional iCloud Keychain sync) and AES-GCM encrypted SharedPreferences on Android. | 7 Nov 2026 |
| [@capacitor-community/sqlite](./capacitor-community-sqlite.md) | A community Capacitor plugin for native and Electron SQLite databases, with SQLCipher encryption on native and a web layer through jeep-sqlite. | 7 Nov 2026 |
| [@ionic/storage](./ionic-storage.md) | Ionic's key-value storage helper built on localForage: IndexedDB and localStorage out of the box, SQLite through an extra driver, encryption through Ionic Secure Storage. | 7 Nov 2026 |
| [idb](./idb.md) | A small library that mirrors the IndexedDB API with promises and usability fixes, for modern browsers. | 7 Nov 2026 |
| [unstorage](./unstorage.md) | A universal key-value layer from UnJS with mountable drivers for memory, filesystem, browser storage, Capacitor Preferences, databases and cloud object stores. | 7 Nov 2026 |
| [js-cookie](./js-cookie.md) | A small client-side JavaScript API for reading, writing and deleting cookies with their attributes. | 7 Nov 2026 |

The facts in each guide come from that library's own pages and the npm registry, with a source and date beside each one. The [comparison pages](https://stratastorage.aoneahsan.com/compare) on the main site put the same facts side by side.
