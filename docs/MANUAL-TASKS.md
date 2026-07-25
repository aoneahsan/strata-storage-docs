# Manual / User-Only Tasks — strata-storage-docs

> The ONE place for everything only you (the human) can do. Fixed path: `docs/MANUAL-TASKS.md`.
> Global spec: `~/.claude/rules/manual-tasks.md`. Excluded from the built site — internal only.
> Last updated: 2026-07-25

## ⏳ Pending manual tasks

_None._

## ✅ Completed manual tasks

| # | Task | Why only you | Completed |
|---|------|--------------|-----------|
| 1 | Add the DNS record `stratastorage-docs.aoneahsan.com` → `aoneahsan.github.io` at Hostinger | Registrar access | 2026-07-25 |

## Reference — this repo's hosting

- **GitHub Pages** from `main` via `.github/workflows/deploy-docs.yml`. No Firebase (a docs site is not a
  Firebase app — `~/.claude/rules/docs-sites.md` §4).
- Custom domain pinned by `static/CNAME`; Docusaurus copies it verbatim into `build/`.
- Domain derivation: parent site `stratastorage.aoneahsan.com` is a **subdomain**, so the docs domain appends
  `-docs` to the first label → `stratastorage-docs.aoneahsan.com` (`rules/docs-sites.md` §1).
- **Certificate history:** the domain previously sat on the `aoneahsan/strata-storage` repo, where GitHub
  never started the TLS request (the Pages API carried no `https_certificate` key at all and HTTPS served the
  `*.github.io` fallback). Releasing the domain from that repo and re-claiming it here moved it straight to
  `authorization_pending` → `approved`. **Reuse that remedy for any stalled GitHub Pages certificate** — DNS
  being correct is not sufficient on its own.
