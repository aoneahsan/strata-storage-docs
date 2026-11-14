/* Strata Storage docs 2.8.4; build 1fd5cb5551507bbd679124a4de28bf997b24457612c7820dfbb9d9eec03466ea */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => { if (event.request.mode === 'navigate') event.respondWith(fetch(event.request, { cache: 'no-store' })); });
