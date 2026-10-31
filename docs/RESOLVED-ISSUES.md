# Resolved issues — Strata Storage docs

### ISSUE-003 — README names a removed GitHub Actions deployment

**Status:** RESOLVED · **Resolved:** 2026-11-01 · **Fix:** docs `37f74fa`, Pages `bdc4552` · **Reported:** 2026-10-31 from the Strata Storage completion run · **Affects:** `README.md`, deployment instructions

**Symptom** — `README.md:40` describes deployment through GitHub Actions, but the repository has no `.github/workflows` directory and the current guide pair requires a manual fast-forward `gh-pages` release.

**Repro** — Read the README deployment section and compare it with `AGENTS.md` / `CLAUDE.md` and `git branch -a`.

**Root cause** — The README was not updated when automated deployment was removed on 2026-10-31.

**Suggested fix** — Replace the stale steps with the locally verified build, controlled-browser check, ordinary fast-forward `gh-pages` publish and live sitemap/robots check.

**Verification** — The owner approved publication. `README.md` documents manual release; `yarn install --immutable`, `yarn typecheck`, `yarn build`, and desktop/mobile browser checks passed. The exact build was pushed to `gh-pages` with an ordinary fast-forward and eight live URLs matched local output byte-for-byte. GitHub Pages reports `legacy` source `gh-pages` at `/`.
