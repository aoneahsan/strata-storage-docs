# Reported issues — Strata Storage docs

### ISSUE-001 — Adapter-free constructors in published examples

**Status:** OPEN · **Reported:** 2026-10-31 from the Strata Storage completion run · **Affects:** docs for `strata-storage@3.1.3`, example pages

**Symptom** — `No available storage adapters. Configured preference: localStorage, indexedDB, sessionStorage, memory. Registered: (none).` when an example constructs `new Strata()` and calls `set()` without registering an adapter. At report time, the source had 245 `new Strata()` occurrences across 58 docs files; this was a candidate count, not a count of confirmed failures.

**Repro** — Follow the opening example in `docs/examples/data-sync.md`: construct `new Strata()` and call `set()` in a browser without a preceding `registerAdapter()` call. The built package rejects the operation with the error above.

**Confirmed locations** — `docs/examples/data-sync.md:16`, `docs/examples/basic/crud.md:23`, `docs/api/adapters/web/localstorage.md:60` and `docs/guides/platforms/web.md:23` use a bare constructor before initialization or storage operations. `docs/api/core/strata.md:59` repeats a bare constructor after its own manual registration lesson. Keep the deliberate registered example in `docs/guides/advanced/custom-adapters.md:180` and the historical “Before” snippet in `docs/migration.md:59`.

**Root cause** — The `Strata` constructor does not register adapters. `defineStorage()` and the exported `storage` instance register the standard web adapters. The seven linked pages corrected in the 2026-10-31 Quick Start pass are excluded from this open scope.

**Suggested fix** — Audit every remaining constructor example in context. Use `defineStorage()` for a web-ready instance, or show the required explicit adapter registration where a bare constructor is the lesson. Compile and run representative snippets, and check native examples on devices.

**2026-11-01 publication checkpoint** — The corrected docs were approved, committed as `37f74fa`, manually published as `bdc4552`, and checked byte-for-byte against the live build. The constructor scan found only deliberate registrations, explanatory prose and the historical repro. The issue stays open for native on-device verification.

### ISSUE-002 — Other documentation claims drifted from the current API

**Status:** OPEN · **Reported:** 2026-10-31 from the Strata Storage completion run · **Affects:** docs for `strata-storage@3.1.3`, reference and platform pages

**Symptom** — `docs/reference/faq.md:63` and `docs/reference/troubleshooting.md:74` say initialization is always required, although the exported `storage` and `defineStorage()` initialize lazily. `docs/api/adapters/web/localstorage.md:24` says the default prefix is empty, but it is `strata:`. `docs/examples/capacitor-app.md:11` omits native adapter registration. `docs/examples/react-native.md:7` presents Capacitor native adapters as React Native support and uses a `biometric` option absent from `StorageOptions`. `docs/api/adapters/web/cookies.md:50` shows fields and casing outside the typed configuration.

**Repro** — Compare those pages against `strata-storage/src/index.ts`, `src/capacitor.ts`, `src/types/index.ts` and the published package exports. For the missing native registration, the example has no `registerCapacitorAdapters()` call before selecting native storage.

**Root cause** — These pages preserve earlier setup and configuration contracts after the package changed. The individual claims were identified by read-only source comparison; native runtime behaviour still needs device verification.

**Suggested fix** — Correct the reference claims and typed examples, run web snippets against the built package, and verify Capacitor paths on devices. Do not imply React Native support without a package-supported adapter path.

**2026-11-01 publication checkpoint** — Corrected Cache, IndexedDB, memory, cookie, Capacitor, encryption and compression claims are live at docs commit `37f74fa` and Pages commit `bdc4552`. Package-backed web samples, typecheck, build and 20 browser views passed. Native on-device verification remains open; browser success does not establish native behavior.
