# Strata Storage docs guide

**Last Updated:** 2026-10-21

**Context verified:** 2026-10-21. **Next routine review:** 2026-11-20.

This public Docusaurus 3 repository, `aoneahsan/strata-storage-docs` on `main`, documents the independent library in `../strata-storage/`. The private marketing site is `../strata-storage-website/`; the private legacy combined checkout is read-only. Content must reflect the library's current public API. Library issues belong in its `docs/REPORTED-ISSUES.md` queue. Never commit secrets to this public repository.

Use Yarn. `yarn install --immutable && yarn build` regenerates `static/llms-full.txt` and checks links. Serve `build/` and inspect desktop and mobile pages in a controlled browser before a `main` push. `.github/workflows/deploy-docs.yml` publishes GitHub Pages on push; `static/CNAME` pins `https://stratastorage-docs.aoneahsan.com/`. Check the Pages run and live sitemap/robots after pushing. On 2026-10-21 the immutable install and production build passed, producing 79 pages and `static/llms-full.txt`; controlled desktop/mobile Chrome checks returned HTTP 200 with no console, request, or overflow failures. The workspace fleet tracker records the deployment run. Update this pair together and observe the 30-day context cooldown.

## Stop-work Git gate

<!-- RULE:stop-work-git-gate v2026-10-20 -->

Before stopping, commit every legitimate change and work-progress checkpoint in this repository and each independent nested repository, fetch and merge the designated upstream, push the documented working branch, then verify an empty worktree and `0 0` ahead/behind. Never stash, discard, reset, rebase, or force-push. If synchronization is blocked, report the exact repository, branch, blocker, and next action instead of calling the work complete. The full workflow remains authoritative in `~/.claude/rules/git-workflow.md`.
