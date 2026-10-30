/**
 * The llms-full plugin: the whole docs site as one plain-text file at `/llms-full.txt`, for one-shot LLM ingestion.
 *
 * It walks `docs/`, strips each page's front matter and prefixes the page with its title and address. It runs in
 * `postBuild`, so the file is written straight into the build output and can never go stale beside it.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { LoadContext, Plugin, PluginModule } from '@docusaurus/types';

export interface LlmsFullOptions {
  /** Docs files that never reach the site, so never reach this file either: the docs plugin's own `exclude` names them too. */
  readonly skipFiles: readonly string[];
}

/** The file's opening paragraph. */
function intro(siteUrl: string): string {
  return (
    '# Strata Storage — full documentation (for LLMs)\n\n' +
    'Zero-dependency universal storage library and Capacitor plugin. One unified\n' +
    'async/sync API across web, Android, iOS, and optional Firebase. This file is the\n' +
    'entire documentation site concatenated for one-shot ingestion. Canonical site:\n' +
    `${siteUrl}  ·  Index: ${siteUrl}/llms.txt  ·  Package: https://www.npmjs.com/package/strata-storage\n`
  );
}

/**
 * Every `.md`/`.mdx` file under a folder, sorted so the output is the same on every build.
 *
 * @param dir - the folder to walk
 * @param skip - file names to leave out
 * @returns absolute file paths
 */
async function collect(dir: string, skip: ReadonlySet<string>): Promise<string[]> {
  const entries = (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name));
  const out: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('_') || skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await collect(full, skip)));
    else if (/\.mdx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Splits a leading YAML front matter block from the page body.
 *
 * @param source - the file's text
 * @returns the front matter (without fences) and the body
 */
function splitFrontmatter(source: string): { frontmatter: string; body: string } {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: '', body: source };
  return { frontmatter: match[1] ?? '', body: source.slice(match[0].length) };
}

/**
 * One front matter field's value, unquoted.
 *
 * @param frontmatter - the front matter text
 * @param key - the field name
 * @returns the value, or null when absent
 */
function field(frontmatter: string, key: string): string | null {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match?.[1] ? match[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

/**
 * A docs file's route on the site, from its `slug` or its path.
 *
 * @param docsDir - the docs folder
 * @param file - the file's absolute path
 * @param frontmatter - its front matter
 * @returns the route, with a leading slash
 */
function routeFor(docsDir: string, file: string, frontmatter: string): string {
  const slug = field(frontmatter, 'slug');
  if (slug) return slug;
  const rel = path
    .relative(docsDir, file)
    .replace(/\\/g, '/')
    .replace(/\.mdx?$/, '')
    .replace(/\/(README|index)$/i, '');
  if (rel === 'README' || rel === 'index' || rel === 'intro') return '/';
  return `/${rel}`;
}

/**
 * The plugin.
 *
 * @param options.skipFiles - docs files that never reach the site
 * @returns the plugin module Docusaurus loads
 */
export default function llmsFull({ skipFiles }: LlmsFullOptions): PluginModule {
  return function llmsFullPlugin(context: LoadContext): Plugin {
    return {
      name: 'llms-full',
      async postBuild({ outDir, siteConfig }) {
        const docsDir = path.join(context.siteDir, 'docs');
        const siteUrl = siteConfig.url.replace(/\/$/, '');
        const parts = [intro(siteUrl)];
        for (const file of await collect(docsDir, new Set(skipFiles))) {
          const { frontmatter, body } = splitFrontmatter(await readFile(file, 'utf8'));
          const title = field(frontmatter, 'title') ?? body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? path.basename(file);
          parts.push(
            '\n\n' +
              '================================================================================\n' +
              `# ${title}\n` +
              `URL: ${siteUrl}${routeFor(docsDir, file, frontmatter)}\n` +
              '================================================================================\n\n' +
              `${body.trim()}\n`
          );
        }
        await writeFile(path.join(outDir, 'llms-full.txt'), parts.join(''), 'utf8');
      },
    };
  };
}
