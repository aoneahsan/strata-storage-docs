---
title: Setting up a white-label Strata Storage package
sidebar_label: Setup timeline
sidebar_position: 3
description: The order a white-label Strata Storage package is set up in, from the licence email to the first published build and the docs on your domain.
tags: [white-label, licensing, setup]
last_update:
  date: 2026-11-14
---

# Setup timeline

Each step waits on the one before it. Licences are paid by bank transfer, using the details and reference on our pay page. Nothing starts until we confirm the transfer; sending it, or a return page, alone doesn't.

1. **Licence email.** Your licence key and certificate arrive by email.
2. **Your npm scope.** You send the scope or package name, and add our release account as a publisher on it.
3. **Your docs domain.** You point the domain you gave with your order to the docs host we tell you, with one DNS record.
4. **Your brand.** You send the name, mark and colours for the docs site.
5. **First build.** We publish the rebranded package and deploy the docs, with the licence file at its fixed path.
6. **Install line.** We send the install command for your developers, for example `yarn add @your-scope/storage`.

After that, each `strata-storage` release during your update period follows the same path. See [updates and renewals](./updates-and-renewals.md).
