// IMPOSTOR Service Worker v1.2
const CACHE = 'impostor-v1';
const PRECACHE = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400;1,600&family=JetBrains+Mono:wght@300;400;500&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Don't intercept socket.io or API calls
  const url = e.request.url;
  if (url.includes('/socket.io') || url.includes('/api/')) return;

  // Network-first strategy: try network, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful GET responses
        if (res.ok && e.request.method === 'GET') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => {
        if (cached) return cached;
        // Offline fallback for navigation
        if (e.request.mode === 'navigate') return caches.match('/');
        return new Response('Offline', { status: 503 });
      }))
  );
});
