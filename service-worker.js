const dataCacheName = 'restaurant-reviews-app-v4';
const filesToCache = [
    '/',
    '/index.html',
    '/restaurant.html',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
    'https://fonts.googleapis.com/css?family=Poor+Story|Poppins:400,600',
    '/css/styles.min.css', 
    '/data/restaurants.json',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    'images/1-270_thumbnail.jpg',
    'images/1-420_extra-small.jpg',
    'images/1-445_medium.jpg',
    'images/1-540_small.jpg',
    'images/1-580_large_1x.jpg',
    'images/1-580_large_2x.jpg',
    'images/2-270_thumbnail.jpg',
    'images/2-420_extra-small.jpg',
    'images/2-445_medium.jpg',
    'images/2-540_small.jpg',
    'images/2-580_large_1x.jpg',
    'images/2-580_large_2x.jpg',
    'images/3-270_thumbnail.jpg',
    'images/3-420_extra-small.jpg',
    'images/3-445_medium.jpg',
    'images/3-540_small.jpg',
    'images/3-580_large_1x.jpg',
    'images/3-580_large_2x.jpg',
    'images/4-270_thumbnail.jpg',
    'images/4-420_extra-small.jpg',
    'images/4-445_medium.jpg',
    'images/4-540_small.jpg',
    'images/4-580_large_1x.jpg',
    'images/4-580_large_2x.jpg',
    'images/5-270_thumbnail.jpg',
    'images/5-420_extra-small.jpg',
    'images/5-445_medium.jpg',
    'images/5-540_small.jpg',
    'images/5-580_large_1x.jpg',
    'images/5-580_large_2x.jpg',
    'images/6-270_thumbnail.jpg',
    'images/6-420_extra-small.jpg',
    'images/6-445_medium.jpg',
    'images/6-540_small.jpg',
    'images/6-580_large_1x.jpg',
    'images/6-580_large_2x.jpg',
    'images/7-270_thumbnail.jpg',
    'images/7-420_extra-small.jpg',
    'images/7-445_medium.jpg',
    'images/7-540_small.jpg',
    'images/7-580_large_1x.jpg',
    'images/7-580_large_2x.jpg',
    'images/8-270_thumbnail.jpg',
    'images/8-420_extra-small.jpg',
    'images/8-445_medium.jpg',
    'images/8-540_small.jpg',
    'images/8-580_large_1x.jpg',
    'images/8-580_large_2x.jpg',
    'images/9-270_thumbnail.jpg',
    'images/9-420_extra-small.jpg',
    'images/9-445_medium.jpg',
    'images/9-540_small.jpg',
    'images/9-580_large_1x.jpg',
    'images/9-580_large_2x.jpg',
    'images/10-270_thumbnail.jpg',
    'images/10-420_extra-small.jpg',
    'images/10-445_medium.jpg',
    'images/10-540_small.jpg',
    'images/10-580_large_1x.jpg',
    'images/10-580_large_2x.jpg'
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
