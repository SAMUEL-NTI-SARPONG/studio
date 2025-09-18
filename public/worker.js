
'use strict';

const CACHE_NAME = 'legend-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/notification.mp3',
  // Next.js build outputs - these paths might need adjustment based on your build
  // This part is tricky without knowing the exact output file names.
  // A more robust solution uses workbox-build to generate this list.
  // For now, we cache the essentials.
];


self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For navigation requests, use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          console.log('[Service Worker] Fetch failed; returning offline page from cache.', error);
          const cache = await caches.open(CACHE_NAME);
          // This assumes you have a fallback offline page cached.
          // For a single-page app, returning the root '/' is often sufficient.
          return cache.match('/');
        }
      })()
    );
    return;
  }

  // For other requests (CSS, JS, images), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        // Optional: Cache new assets dynamically.
        // Be careful with this, as it can cache API responses or other dynamic content.
        // if (networkResponse.status === 200 && event.request.url.startsWith('http')) {
        //   const cache = await caches.open(CACHE_NAME);
        //   cache.put(event.request, networkResponse.clone());
        // }
        return networkResponse;
      });
    })
  );
});


self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data.payload;
    const notificationTime = event.data.payload.notificationTime;

    if (Date.now() >= notificationTime) {
       console.log('[Service Worker] Showing notification now:', title);
       self.registration.showNotification(title, options);
    } else {
       console.log('[Service Worker] Notification is scheduled for the future, this should not happen with this strategy.');
    }
  }
});
