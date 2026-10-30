---
slug: strata-storage-3-1-1
title: Strata Storage 3.1.1
description: "Same-key raw imports keep the migrated value (ISSUE-14)."
date: 2026-10-21
tags: [release]
---

Same-key raw imports keep the migrated value (ISSUE-14).

<!-- truncate -->

## Fixed

- **Same-key raw imports preserve the migrated value** (ISSUE-14). When `keyPrefix: false` makes the named raw source and destination the same physical key, `importRawSync` now keeps the newly written Strata envelope instead of deleting it. Distinct-key imports still remove the source only after the destination write succeeds.

Full history: [the changelog](/reference/changelog). Install: `yarn add strata-storage@3.1.1`.
