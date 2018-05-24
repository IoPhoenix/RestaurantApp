var dataCacheName = 'restaurant-reviews-app-v1';
var filesToCache = [
    '/RestaurantApp/',
    '/RestaurantApp/index.html',
    '/RestaurantApp/restaurant.html',
    'https://fonts.googleapis.com/css?family=Poor+Story|Poppins:400,600',
    '/RestaurantApp/css/styles.min.css',    
    '/RestaurantApp/data/restaurants.json',
    '/RestaurantApp/js/main.js',
    '/RestaurantApp/js/dbhelper.js',
    '/RestaurantApp/js/restaurant_info.js',
    'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.0/normalize.min.css',
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyAV7dZNt-afI1MX_Qxc5CCDCkGWp_1A3RU&libraries=places&callback=initMap',
    '/RestaurantApp/images/1-270_thumbnail.jpg',
    '/RestaurantApp/images/1-420_extra-small.jpg',
    '/RestaurantApp/images/1-445_medium.jpg',
    '/RestaurantApp/images/1-540_small.jpg',
    '/RestaurantApp/images/1-580_large_1x.jpg',
    '/RestaurantApp/images/1-580_large_2x.jpg',
    '/RestaurantApp/images/2-270_thumbnail.jpg',
    '/RestaurantApp/images/2-420_extra-small.jpg',
    '/RestaurantApp/images/2-445_medium.jpg',
    '/RestaurantApp/images/2-540_small.jpg',
    '/RestaurantApp/images/2-580_large_1x.jpg',
    '/RestaurantApp/images/2-580_large_2x.jpg',
    '/RestaurantApp/images/3-270_thumbnail.jpg',
    '/RestaurantApp/images/3-420_extra-small.jpg',
    '/RestaurantApp/images/3-445_medium.jpg',
    '/RestaurantApp/images/3-540_small.jpg',
    '/RestaurantApp/images/3-580_large_1x.jpg',
    '/RestaurantApp/images/3-580_large_2x.jpg',
    '/RestaurantApp/images/4-270_thumbnail.jpg',
    '/RestaurantApp/images/4-420_extra-small.jpg',
    '/RestaurantApp/images/4-445_medium.jpg',
    '/RestaurantApp/images/4-540_small.jpg',
    '/RestaurantApp/images/4-580_large_1x.jpg',
    '/RestaurantApp/images/4-580_large_2x.jpg',
    '/RestaurantApp/images/5-270_thumbnail.jpg',
    '/RestaurantApp/images/5-420_extra-small.jpg',
    '/RestaurantApp/images/5-445_medium.jpg',
    '/RestaurantApp/images/5-540_small.jpg',
    '/RestaurantApp/images/5-580_large_1x.jpg',
    '/RestaurantApp/images/5-580_large_2x.jpg',
    '/RestaurantApp/images/6-270_thumbnail.jpg',
    '/RestaurantApp/images/6-420_extra-small.jpg',
    '/RestaurantApp/images/6-445_medium.jpg',
    '/RestaurantApp/images/6-540_small.jpg',
    '/RestaurantApp/images/6-580_large_1x.jpg',
    '/RestaurantApp/images/6-580_large_2x.jpg',
    '/RestaurantApp/images/7-270_thumbnail.jpg',
    '/RestaurantApp/images/7-420_extra-small.jpg',
    '/RestaurantApp/images/7-445_medium.jpg',
    '/RestaurantApp/images/7-540_small.jpg',
    '/RestaurantApp/images/7-580_large_1x.jpg',
    '/RestaurantApp/images/7-580_large_2x.jpg',
    '/RestaurantApp/images/8-270_thumbnail.jpg',
    '/RestaurantApp/images/8-420_extra-small.jpg',
    '/RestaurantApp/images/8-445_medium.jpg',
    '/RestaurantApp/images/8-540_small.jpg',
    '/RestaurantApp/images/8-580_large_1x.jpg',
    '/RestaurantApp/images/8-580_large_2x.jpg',
    '/RestaurantApp/images/9-270_thumbnail.jpg',
    '/RestaurantApp/images/9-420_extra-small.jpg',
    '/RestaurantApp/images/9-445_medium.jpg',
    '/RestaurantApp/images/9-540_small.jpg',
    '/RestaurantApp/images/9-580_large_1x.jpg',
    '/RestaurantApp/images/9-580_large_2x.jpg',
    '/RestaurantApp/images/10-270_thumbnail.jpg',
    '/RestaurantApp/images/10-420_extra-small.jpg',
    '/RestaurantApp/images/10-445_medium.jpg',
    '/RestaurantApp/images/10-540_small.jpg',
    '/RestaurantApp/images/10-580_large_1x.jpg',
    '/RestaurantApp/images/10-580_large_2x.jpg'
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
  // The app is asking for app shell files. In this scenario the app uses the
  // "Cache, falling back to the network" offline strategy
  e.respondWith(
      caches.match(e.request).then(function(response) {
        return response || fetch(e.request);
      })
    );
});