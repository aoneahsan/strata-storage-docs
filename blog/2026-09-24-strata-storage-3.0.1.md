---
slug: strata-storage-3-0-1
title: Strata Storage 3.0.1
description: "Android: consuming apps on current AGP configure strata-storage again (ISSUE-12)."
date: 2026-09-24
tags: [release]
---

Android: consuming apps on current AGP configure strata-storage again (ISSUE-12).

<!-- truncate -->

## Fixed

- **Android: consuming apps on current AGP failed to configure `:strata-storage`** (ISSUE-12).
  `android/build.gradle` referenced `getDefaultProguardFile('proguard-android.txt')`, which current Android
  Gradle Plugin versions reject at configuration time because it includes `-dontoptimize` — so the whole
  app build failed even though the library sets `minifyEnabled false`. Now uses
  `proguard-android-optimize.txt`, like every official Capacitor plugin. No JavaScript or API change.

Full history: [the changelog](/reference/changelog). Install: `yarn add strata-storage@3.0.1`.
