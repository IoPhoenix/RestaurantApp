const dataCacheName = 'restaurant-reviews-app-v0';
// cache everything in the app folder
const filesToCache = [
    '/'
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
