// Cupiddle Progressive Web App (PWA) Service Worker - v3
const CACHE_NAME = 'cupiddle-v3-cache';

// Only precache static shell assets, NEVER index.html (to prevent stale JS chunk 404s)
const PRECACHE_URLS = [
  '/manifest.json',
  '/cupiddle-icon.svg',
  '/cupiddle-icon.png',
  '/cupiddle-logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Purge ALL older caches immediately to ensure users receive latest React bundle
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Purging outdated cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // 1. Let API calls, media uploads, and WebSocket bypass SW entirely
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('/ws') ||
    event.request.url.includes('/uploads/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // 2. Navigation / Document requests: NETWORK-FIRST
  // This guarantees users ALWAYS get the latest index.html with up-to-date Vite chunk hashes
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If completely offline, fall back to cached document
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // 3. Static assets: Stale-While-Revalidate with network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
