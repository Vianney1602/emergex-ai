/**
 * EmergeX AI — Service Worker
 * Cache-first for static assets, network-first for API / tile requests.
 */

const CACHE_NAME = 'emergex-v1';
const STATIC_ASSETS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Network-first for tile / API requests
  if (request.url.includes('basemaps.cartocdn') || request.url.includes('nominatim')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
  // Cache-first for everything else
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
