const BUILD_ID = '__P2P_BUILD_ID__';
const CACHE_NAME = `p2p-file-transfer-${BUILD_ID}`;
const APP_SHELL = '/';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(APP_SHELL, { cache: 'reload' });
      if (response.ok) await cache.put(APP_SHELL, response.clone());
    } catch {
      // A first install can still complete if the shell is temporarily offline.
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.startsWith('p2p-file-transfer-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.status === 200) {
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        } catch {
          // Do not block the online response if the browser cannot cache it.
        }
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate') {
        const appShell = await caches.match(APP_SHELL);
        if (appShell) return appShell;
      }
      return Response.error();
    }
  })());
});
