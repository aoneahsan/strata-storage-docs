/**
 * Every place Strata Storage is released — the ONLY place a store or surface URL lives in this docs site
 * (standard aoneahsan-cccs-platform-links). Each surface passed its release proof on `verified`:
 * npm answers `npm view strata-storage version`, the website and this site answered 200.
 */
export type PlatformId = 'npm' | 'web' | 'docs';

export interface Platform {
  id: PlatformId;
  /** Store or surface name (a proper name, not copy). */
  name: string;
  href: string;
  /** What this surface is for, in Strata Storage's words. */
  title: string;
  text: string;
  cta: string;
  primary?: boolean;
  verified: string;
}

export const PLATFORMS: readonly Platform[] = [
  {id: 'npm', name: 'npm', href: 'https://www.npmjs.com/package/strata-storage', title: 'npm install strata-storage', text: 'One key/value API over browser and Capacitor storage adapters. Add it to your web or Capacitor app.', cta: 'View on npm', primary: true, verified: '2026-11-20'},
  {id: 'web', name: 'Strata Storage website', href: 'https://stratastorage.aoneahsan.com', title: 'The website', text: 'What it does, the adapters it ships, and how to support the project.', cta: 'Open the website', verified: '2026-11-20'},
  {id: 'docs', name: 'Documentation', href: 'https://stratastorage-docs.aoneahsan.com', title: 'These docs', text: 'Installation, the API reference, every adapter, and a page written for AI agents.', cta: 'Read the docs', verified: '2026-11-20'},
];

export const APPS_PAGE = {
  title: 'Get Strata Storage',
  description: 'Every place Strata Storage is released: the npm package, its website and these docs.',
  lead: 'Install it from npm, read about it on the website, and keep these docs a tab away.',
} as const;

/** This site is the docs surface. */
export const CURRENT_SURFACE: PlatformId = 'docs';
export const OTHER_PLATFORMS: readonly Platform[] = PLATFORMS.filter((platform) => platform.id !== CURRENT_SURFACE);
export const PRIMARY_PLATFORM: Platform = PLATFORMS.find((platform) => platform.primary) ?? PLATFORMS[0];
export function platformHref(id: PlatformId): string {
  const found = PLATFORMS.find((platform) => platform.id === id);
  if (!found) throw new Error(`Unknown platform: ${id}`);
  return found.href;
}
/** `/apps` changes only when this list does: its sitemap date is the newest proof date. */
export const APPS_LASTMOD: string = PLATFORMS.map((platform) => platform.verified).sort().at(-1) ?? '2026-11-20';
