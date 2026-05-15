// HC-LIMS Service Worker — PWA offline support
// Version: v2 — updated 2026-05-15
const CACHE = 'hc-lims-v2';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  // Delete old cache versions
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  // Take control of all clients immediately
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Only cache same-origin GET requests
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
  
  // Don't cache dev server HMR or API calls
  if (e.request.url.includes('/@vite/') || e.request.url.includes('/api/')) return;
  
  // Network-first strategy for JS modules (always get latest)
  if (e.request.destination === 'script' || e.request.url.includes('/src/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  
  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
