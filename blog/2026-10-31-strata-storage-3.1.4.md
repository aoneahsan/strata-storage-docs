---
slug: strata-storage-3-1-4
title: Strata Storage 3.1.4
description: "The optional Firebase adapter names are now in StorageType; runtime behaviour is unchanged."
date: 2026-10-31
tags: [release]
---

Version 3.1.4 fixes the TypeScript names for the optional Firebase adapters. After registering the Firestore or Realtime Database adapter, you can select `{ storage: 'firestore' }` or `{ storage: 'realtime' }` without a type cast.

<!-- truncate -->

The adapters already worked at runtime. This release adds their names to `StorageType` and updates the README's release guidance; it does not change runtime behaviour. Register the optional Firebase adapter before selecting it, and test the path your app uses.

Upgrade with:

```bash
yarn add strata-storage@3.1.4
```

Read the [full changelog](/reference/changelog) for the exact release record.
