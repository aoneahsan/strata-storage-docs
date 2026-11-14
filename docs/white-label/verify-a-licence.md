---
title: Verify a white-label Strata Storage licence
sidebar_label: Verify a licence
sidebar_position: 5
description: Check a white-label Strata Storage licence by its key or by the docs domain that serves its licence file.
tags: [white-label, licensing, verification]
last_update:
  date: 2026-11-14
---

# Verify a licence

Anyone can check a licence on the [verify page](https://stratastorage.aoneahsan.com/verify-license). Verification is run by our licensing service.

## By key

Paste the key. It starts with `STRATASTORAGE-WL-` and is in the buyer's licence email and on their certificate. The answer shows the client, the domains, the status and the date releases run until.

## By domain

Enter the domain of the package's docs site. A licensed docs site serves this file:

```text
/.well-known/stratastorage-white-label-license.json
```

The check reads that file and confirms the key it names belongs to that domain.

## On a licensed docs site

A docs build made for a licence carries its key. When it opens on a domain the licence doesn't cover, or the licence is revoked, the page shows a notice that the licence is not active, with a link to the verify page. If the check can't reach our service, the docs open as normal.
