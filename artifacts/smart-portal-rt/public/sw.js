// Smart Portal RT 005 — Service Worker
// Cache static assets untuk loading lebih cepat, selalu fetch-fresh untuk /api

const CACHE_NAME = 'smart-portal-rt-v1';

// Aset statis yang di-cache saat install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/_sync.js',
  '/manifest.json',
  '/Lambang_Kota_Semarang.png',
  '/favicon.svg'
];

// Install: pre-cache aset statis
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: strategi Network-first untuk /api, Cache-first untuk aset statis
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // /api dan SSE stream: selalu ke network (tidak di-cache)
  if (url.pathname.startsWith('/api')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // CDN external: network-first dengan fallback cache
  if (!url.origin.includes(self.location.origin)) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Aset lokal: cache-first dengan network fallback + update cache di background
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Pesan dari halaman utama
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
