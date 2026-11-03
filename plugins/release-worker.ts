import { createHash } from 'node:crypto';
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { LoadContext, Plugin } from '@docusaurus/types';

/** One worker per docs build. It caches no pages or account data. */
export default function releaseWorker({ version }: { version: string }) {
  return function releaseWorkerPlugin(_context: LoadContext): Plugin {
    return {
      name: 'strata-docs-release-worker',
      async postBuild({ outDir }) {
        const revision = createHash('sha256');
        for (const file of (await readdir(outDir, { recursive: true })).sort()) {
          if (file === 'sw.js') continue;
          const fullPath = path.join(outDir, file);
          if (!(await stat(fullPath)).isFile()) continue;
          revision.update(file);
          revision.update(await readFile(fullPath));
        }
        const source = `/* Strata Storage docs ${version}; build ${revision.digest('hex')} */\n` +
          `self.addEventListener('install', () => self.skipWaiting());\n` +
          `self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));\n` +
          `self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });\n` +
          `self.addEventListener('fetch', (event) => { if (event.request.mode === 'navigate') event.respondWith(fetch(event.request, { cache: 'no-store' })); });\n`;
        await writeFile(path.join(outDir, 'sw.js'), source);
      },
    };
  };
}
