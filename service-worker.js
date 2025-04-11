// Define a cache name and the list of files to cache
const CACHE_NAME = 'kenya-creators-cache-v1';
const urlsToCache = [
  '/',
  '/login.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/assets/images/auth-bg.svg'
  // Add any additional assets you want cached, such as CSS/JS files.
];

// Installation event: Cache essential resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation event: Clean up outdated caches if needed
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting outdated cache:', cache);
            return caches.delete(cache);
          }
        })
      )
    )
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached asset if available, otherwise perform a network request.
        return response || fetch(event.request);
      })
  );
});
