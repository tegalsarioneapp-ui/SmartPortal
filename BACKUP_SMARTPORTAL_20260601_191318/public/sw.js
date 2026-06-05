// Smart Portal RT 005 — Service Worker v4
// Stale-while-revalidate · App shell · Push · Background sync · Native Android PWA

const CACHE_VER  = 'v4';
const SHELL_CACHE = `rt005-shell-${CACHE_VER}`;
const DATA_CACHE  = `rt005-data-${CACHE_VER}`;
const IMG_CACHE   = `rt005-img-${CACHE_VER}`;

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/Lambang_Kota_Semarang.png',
  '/benny-avatar.png',
  '/_sync.js'
];

// ─── Install — pre-cache app shell ─────────────────────────────────────────────
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate — clean stale caches ────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL_CACHE, DATA_CACHE, IMG_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Navigation Preload (Android speed) ──────────────────────────────────────
self.addEventListener('activate', (e) => {
  if (self.registration.navigationPreload) {
    e.waitUntil(self.registration.navigationPreload.enable());
  }
});

// ─── Fetch — tiered strategy ──────────────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const url  = new URL(e.request.url);
  const req  = e.request;

  // 1. API -- network only, never cache, always use relative URL
  if (url.pathname.startsWith('/api')) {
    const relativeUrl = url.pathname + url.search;
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const relativeReq = new Request(relativeUrl, {
      method: req.method,
      headers: req.headers,
      body: hasBody ? req.body : undefined,
      mode: 'same-origin',
      credentials: 'same-origin',
      redirect: req.redirect,
      ...(hasBody ? { duplex: 'half' } : {}),
    });
    e.respondWith(fetch(relativeReq).catch(() =>
      new Response(JSON.stringify({ error: 'offline' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // 2. External CDN fonts/icons — network-first, cache fallback
  if (url.origin !== self.location.origin) {
    e.respondWith(
      caches.open(IMG_CACHE).then((c) =>
        fetch(req).then((res) => {
          if (res.ok) c.put(req, res.clone());
          return res;
        }).catch(() => c.match(req))
      )
    );
    return;
  }

  // 3. Images — cache-first, background refresh
  if (/\.(png|jpg|jpeg|svg|webp|gif|ico)$/i.test(url.pathname)) {
    e.respondWith(
      caches.open(IMG_CACHE).then((c) =>
        c.match(req).then((cached) => {
          const fresh = fetch(req).then((res) => {
            if (res.ok) c.put(req, res.clone());
            return res;
          });
          return cached || fresh;
        })
      )
    );
    return;
  }

  // 4. HTML navigation — network-first with preload, offline shell fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          const preload = await e.preloadResponse;
          if (preload) return preload;
          const res = await fetch(req);
          const cache = await caches.open(SHELL_CACHE);
          cache.put(req, res.clone());
          return res;
        } catch {
          const cached = await caches.match('/index.html');
          return cached || new Response('<h1>Offline</h1>', {
            headers: { 'Content-Type': 'text/html' }
          });
        }
      })()
    );
    return;
  }

  // 5. App shell assets — stale-while-revalidate
  e.respondWith(
    caches.open(SHELL_CACHE).then((c) =>
      c.match(req).then((cached) => {
        const fresh = fetch(req).then((res) => {
          if (res && res.status === 200) c.put(req, res.clone());
          return res;
        }).catch(() => cached);
        return cached || fresh;
      })
    )
  );
});

// ─── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  const defaults = {
    title: 'Smart Portal RT 005',
    body: 'Ada update terbaru dari RT 005 Tegalsari!',
    icon: '/Lambang_Kota_Semarang.png',
    badge: '/favicon.svg',
    url: '/'
  };
  let data = defaults;
  if (e.data) {
    try { data = { ...defaults, ...JSON.parse(e.data.text()) }; } catch {}
  }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: [100, 50, 100, 50, 200],
      tag: 'rt005',
      renotify: true,
      requireInteraction: false,
      silent: false,
      data: { url: data.url, timestamp: Date.now() },
      actions: [
        { action: 'open',  title: '📱 Buka Portal' },
        { action: 'close', title: 'Tutup' }
      ]
    })
  );
});

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'close') return;

  const target = e.notification.data?.url ?? '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if ('focus' in c) { c.focus(); if ('navigate' in c) c.navigate(target); return; }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});

// ─── Push Subscription Change ─────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (e) => {
  e.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: e.oldSubscription?.options?.applicationServerKey
    }).then((sub) =>
      fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      }).catch(() => {})
    ).catch(() => {})
  );
});

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-data') {
    e.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'SYNC_TRIGGERED' }));
      })
    );
  }
});

// ─── Message from page ────────────────────────────────────────────────────────
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data?.type === 'GET_VERSION')  e.source?.postMessage({ type: 'VERSION', version: CACHE_VER });
});
