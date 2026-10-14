# Strata Storage docs guide

**Context verified:** 2026-10-14. **Next routine review:** 2026-11-13.

This public Docusaurus 3 repository, `aoneahsan/strata-storage-docs` on `main`, documents the independent library in `../strata-storage/`. The private marketing site is `../strata-storage-website/`; the private legacy combined checkout is read-only. Content must reflect the library's current public API. Library issues belong in its `docs/REPORTED-ISSUES.md` queue. Never commit secrets to this public repository.

Use Yarn. `yarn install --immutable && yarn build` regenerates `static/llms-full.txt` and checks links. Serve `build/` and inspect desktop and mobile pages in a controlled browser before a `main` push. `.github/workflows/deploy-docs.yml` publishes GitHub Pages on push; `static/CNAME` pins `https://stratastorage-docs.aoneahsan.com/`. Check the Pages run and live sitemap/robots after pushing. On 2026-10-14 the local immutable install, build and Chrome desktop/mobile checks passed; the workspace fleet tracker records the deployment run. Update this pair together and observe the 30-day context cooldown.
