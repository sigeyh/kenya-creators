// service-worker.js

// Set a cache name
const CACHE_NAME = 'kenya-creators-cache-v1';

// List of URLs to cache during the install step
const urlsToCache = [
  '/login.html',
  '/manifest.json',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // External stylesheets and scripts you want to cache can be added here.
  // For example, if you want to pre-cache your Tailwind CSS library from CDN,
  // include the URL below. However, note that CDN files might update, so assess if caching them is appropriate.
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event: cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activate worker immediately even if there are older ones.
  );
});

// Activate event: delete old caches if necessary
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Remove caches that are not the current one.
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim()) // Ensure that the worker takes control of pages immediately.
  );
});

// Fetch event: serve cached content when available
self.addEventListener('fetch', event => {
  event.respondWith(
    // Look for a matching request in the cache
    caches.match(event.request)
      .then(response => {
        // If the request is found in the cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch from network.
        return fetch(event.request).then(networkResponse => {
          // Optionally, cache new requests dynamically. This approach is called "cache then network".
          return caches.open(CACHE_NAME).then(cache => {
            // Clone the response because it is a stream and can only be consumed once.
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(error => {
          // Handle exceptions by, for example, returning an offline fallback page.
          console.error('Fetch failed; returning offline page instead.', error);
          // Return an offline page or a default error message if appropriate.
          // return caches.match('/offline.html');
        });
      })
  );
});
