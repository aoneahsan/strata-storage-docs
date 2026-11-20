/* Strata Storage docs 2.8.4; build b0bf2ce1c8902cca4c28471d1f9bbd11475de1b1611a3728a48a5841ddbbdd21 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => { if (event.request.mode === 'navigate') event.respondWith(fetch(event.request, { cache: 'no-store' })); });
