/* Strata Storage docs 2.8.4; build 30a2ba3b5d917ce0ae08fd2c7aebc53bfbf8e252ef5cabf063a1f6b41d920610 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => { if (event.request.mode === 'navigate') event.respondWith(fetch(event.request, { cache: 'no-store' })); });
