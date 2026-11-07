---
title: Moving from js-cookie to Strata Storage
sidebar_label: From js-cookie
description: Replace js-cookie reads and writes with Strata Storage's cookie adapter, map attributes, and why cookies a server reads should stay on js-cookie.
tags: [migration, compare]
last_update:
  date: 2026-11-07
---

# Moving from js-cookie

Read this before you change anything: Strata's cookie adapter stores a JSON envelope under a `strata_` prefix, not your bare value. A server, or any other script reading `theme=dark`, won't find it. Cookies that anything else reads should stay on js-cookie. Move only the ones your client code alone reads.

## The calls

| js-cookie | Strata Storage |
|---|---|
| `Cookies.set(name, value)` | `storage.set(name, value, { storage: 'cookies' })` |
| `Cookies.get(name)` | `storage.get(name, { storage: 'cookies' })` |
| `Cookies.remove(name)` | `storage.remove(name, { storage: 'cookies' })` |
| `Cookies.set(name, value, { expires: 7 })` | `storage.set(name, value, { storage: 'cookies', ttl: 7 * 86_400_000 })` |
| `{ secure, sameSite }` | `adapters: { cookies: { secure, sameSite } }`, set once on the instance |
| `{ domain, path }` | `new CookieAdapter('strata_', { domain, path })` ([cookie adapter](../api/adapters/web/cookies.md)) |

js-cookie's `expires` counts days; `ttl` counts milliseconds. `secure` and `sameSite` aren't per-call options here.

## Move named cookies

`Cookies.get()` returns every cookie the page can see, including ones you don't own, so list yours by name.

```ts
import Cookies from 'js-cookie';
import { defineStorage } from 'strata-storage';

export const storage = defineStorage({ adapters: { cookies: { secure: true, sameSite: 'lax' } } });

const OURS = ['theme', 'language'];

export async function moveCookies(): Promise<void> {
  for (const name of OURS) {
    const value = Cookies.get(name);
    if (value === undefined) continue;
    await storage.set(name, value, { storage: 'cookies', ttl: 30 * 86_400_000 });
    Cookies.remove(name);
  }
}
```

js-cookie doesn't report a cookie's expiry, so the copy has to choose one. Removing the old cookie in the same pass makes the loop safe to repeat. If you set a `path` or `domain` when writing it, pass the same ones to `Cookies.remove`, or the old cookie survives.

The adapter reports a 4 KB per-cookie limit, and the envelope takes some of it, so try your longest value. JavaScript can't write `HttpOnly` cookies with either library, and session secrets don't belong in these.

## js-cookie as we checked it

Last checked 7 Nov 2026. "Not stated" means the pages we checked don't mention it, not that the library can't do it. [Check js-cookie yourself](https://github.com/js-cookie/js-cookie), or see the [side-by-side page](https://stratastorage.aoneahsan.com/compare/js-cookie).

| Store or capability | js-cookie | Strata Storage |
|---|---|---|
| localStorage | Not stated on the pages we checked | Yes |
| IndexedDB | Not stated on the pages we checked | Yes |
| sessionStorage | Not stated on the pages we checked | Yes |
| Cookies | Yes ([source](https://github.com/js-cookie/js-cookie/blob/main/README.md), 7 Nov 2026) | Yes |
| URL parameters as a store | Not stated on the pages we checked | Yes |
| iOS Keychain | Not stated on the pages we checked | Yes |
| Android secure storage (Keystore-backed) | Not stated on the pages we checked | Yes |
| Native preferences (UserDefaults / SharedPreferences) | Not stated on the pages we checked | Yes |
| Web and native stores behind one API | Not stated on the pages we checked | Yes |
| No runtime dependencies | Yes ([source](https://registry.npmjs.org/js-cookie/latest), 7 Nov 2026) | Yes |

| Package fact | js-cookie | Strata Storage |
|---|---|---|
| Licence | MIT ([source](https://registry.npmjs.org/js-cookie/latest)) | MIT ([source](https://registry.npmjs.org/strata-storage/latest)) |
| npm version | 3.0.8 | 3.1.4 |
| Bundle size | 803 bytes gzipped, 1,574 minified, version 3.0.8, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=js-cookie)) | 21,468 bytes gzipped, 79,645 minified, version 3.1.4, 7 Nov 2026 ([source](https://bundlephobia.com/api/size?package=strata-storage)) |
| Weekly downloads | 44,197,779, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/js-cookie)) | 486, 31 Oct 2026 to 6 Nov 2026 ([source](https://api.npmjs.org/downloads/point/last-week/strata-storage)) |
