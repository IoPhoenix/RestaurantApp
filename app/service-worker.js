
const dataCacheName = 'restaurant-reviews-app-v0';
const filesToCache = [
    '/',
    'index.html',
    'restaurant.html',
    'manifest.json',
    'temp/assets/styles/styles.css', 
    'temp/assets/scripts/app.js',
    'temp/assets/scripts/restaurant.js',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
    'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
    'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
    'https://fonts.gstatic.com/s/poppins/v5/pxiByp8kv8JHgFVrLEj6Z1xlEA.ttf',
    'https://fonts.gstatic.com/s/poorstory/v4/jizfREFUsnUct9P6cDfd0O6tKA.ttf',
    'assets/images/1_thumbnail.webp',
    'assets/images/1_extra-small.webp',
    'assets/images/1_medium.webp',
    'assets/images/1_small.webp',
    'assets/images/1_large_1x.webp',
    'assets/images/1_large_2x.webp',
    'assets/images/2_thumbnail.webp',
    'assets/images/2_extra-small.webp',
    'assets/images/2_medium.webp',
    'assets/images/2_small.webp',
    'assets/images/2_large_1x.webp',
    'assets/images/2_large_2x.webp',
    'assets/images/3_thumbnail.webp',
    'assets/images/3_extra-small.webp',
    'assets/images/3_medium.webp',
    'assets/images/3_small.webp',
    'assets/images/3_large_1x.webp',
    'assets/images/3_large_2x.webp',
    'assets/images/4_thumbnail.webp',
    'assets/images/4_extra-small.webp',
    'assets/images/4_medium.webp',
    'assets/images/4_small.webp',
    'assets/images/4_large_1x.webp',
    'assets/images/4_large_2x.webp',
    'assets/images/5_thumbnail.webp',
    'assets/images/5_extra-small.webp',
    'assets/images/5_medium.webp',
    'assets/images/5_small.webp',
    'assets/images/5_large_1x.webp',
    'assets/images/5_large_2x.webp',
    'assets/images/6_thumbnail.webp',
    'assets/images/6_extra-small.webp',
    'assets/images/6_medium.webp',
    'assets/images/6_small.webp',
    'assets/images/6_large_1x.webp',
    'assets/images/6_large_2x.webp',
    'assets/images/7_thumbnail.webp',
    'assets/images/7_extra-small.webp',
    'assets/images/7_medium.webp',
    'assets/images/7_small.webp',
    'assets/images/7_large_1x.webp',
    'assets/images/7_large_2x.webp',
    'assets/images/8_thumbnail.webp',
    'assets/images/8_extra-small.webp',
    'assets/images/8_medium.webp',
    'assets/images/8_small.webp',
    'assets/images/8_large_1x.webp',
    'assets/images/8_large_2x.webp',
    'assets/images/9_thumbnail.webp',
    'assets/images/9_extra-small.webp',
    'assets/images/9_medium.webp',
    'assets/images/9_small.webp',
    'assets/images/9_large_1x.webp',
    'assets/images/9_large_2x.webp',
    'assets/images/10_thumbnail.webp',
    'assets/images/10_extra-small.webp',
    'assets/images/10_medium.webp',
    'assets/images/10_small.webp',
    'assets/images/10_large_1x.webp',
    'assets/images/10_large_2x.webp'
];


self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(dataCacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});


// activate SW
self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
          // update cache whenever any of the app shell files change 
          if (key !== dataCacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // activate the service worker faster 
  // (fixes a corner case in which the app wasn't returning the latest data)
  return self.clients.claim();
});


// intercept requests made from the app 
self.addEventListener('fetch', function(e) {
  e.respondWith(
    // look at the request and find any cached results from the caches SW created
    caches.match(e.request)
      .then(function(response) {
        // return cache value if match is found:
        if (response) return response;

        // if not, handle the result of a call to fetch:
        const clonedRequest = e.request.clone();

        return fetch(clonedRequest).then(
          function(response) {
            // check that response is valid:
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // cache the cloned response:
            const responseToCache = response.clone();
            caches.open(dataCacheName).then(cache => cache.put(e.request, responseToCache));

            // return repsonse after caching it:
            return response;
          }
        );
      })
    );
});
