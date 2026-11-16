# Packages — strata-storage-docs

**Last Updated:** 2026-11-16 (fleet Node 26.13.1 pass: `.nvmrc` 26.13.1, `engines.node >=26.13.1`; every package already at latest stable) · Internal record, excluded from the site (`INTERNAL_FILES` in `docusaurus.config.ts`).
TypeScript is on `~7.0.2`: this site uses no typescript-eslint or Capacitor CLI, the two tools the fleet TypeScript 7 pin protects.

| Package | Range | Kind |
|---|---|---|
| `@docusaurus/core` | 3.10.2 | dependencies |
| `@docusaurus/faster` | 3.10.2 | dependencies |
| `@docusaurus/plugin-content-docs` | 3.10.2 | dependencies |
| `@docusaurus/preset-classic` | 3.10.2 | dependencies |
| `@docusaurus/theme-common` | 3.10.2 | dependencies |
| `@easyops-cn/docusaurus-search-local` | ^0.55.3 | dependencies |
| `@mdx-js/react` | ^3.1.1 | dependencies |
| `clsx` | ^2.1.1 | dependencies |
| `prism-react-renderer` | ^2.4.1 | dependencies |
| `react` | ^19.3.1 | dependencies |
| `react-dom` | ^19.3.1 | dependencies |
| `@docusaurus/module-type-aliases` | 3.10.2 | devDependencies |
| `@docusaurus/plugin-content-blog` | 3.10.2 | devDependencies |
| `@docusaurus/types` | 3.10.2 | devDependencies |
| `@types/node` | ^26.6.6 | devDependencies |
| `@types/react` | ^19.3.0 | devDependencies |
| `@types/react-dom` | ^19.3.0 | devDependencies |
| `typescript` | ~7.0.2 | devDependencies |

## Workaround — `NODE_OPTIONS=--no-experimental-webstorage` in `build`

- **Why:** on Node 26, Docusaurus 3.10.2's SSG renderer (`@docusaurus/core/lib/ssg/ssgRenderer.js` → the `eval`
  package) copies every global, and reading Node's experimental `localStorage` getter prints
  `ExperimentalWarning: localStorage is not available because --localstorage-file was not provided`. The build must
  print zero warnings. The flag removes the experimental global; the docs never use it at build time. Node 26.13.1 (`.nvmrc`) accepts it.
- **Re-check when:** Docusaurus is upgraded, or Node's web storage leaves experimental status.
- **Remove:** drop the prefix from `build`, run `yarn build`, and confirm no `ExperimentalWarning` line.
