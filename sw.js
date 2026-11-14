/* Strata Storage docs 2.8.4; build eb54a150b8845b3a9c68505481a5486bea7d4105220ee5b1fe3b1c44c8d13c3b */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => { if (event.request.mode === 'navigate') event.respondWith(fetch(event.request, { cache: 'no-store' })); });
