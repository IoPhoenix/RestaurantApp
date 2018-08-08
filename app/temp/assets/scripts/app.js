!function(r){var e={};function n(t){if(e[t])return e[t].exports;var a=e[t]={i:t,l:!1,exports:{}};return r[t].call(a.exports,a,a.exports,n),a.l=!0,a.exports}n.m=r,n.c=e,n.d=function(r,e,t){n.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:t})},n.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},n.t=function(r,e){if(1&e&&(r=n(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var t=Object.create(null);if(n.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var a in r)n.d(t,a,function(e){return r[e]}.bind(null,a));return t},n.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return n.d(e,"a",e),e},n.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},n.p="",n(n.s="./app/assets/scripts/app.js")}({"./app/assets/scripts/app.js":
/*!***********************************!*\
  !*** ./app/assets/scripts/app.js ***!
  \***********************************/
/*! no exports provided */function(module,__webpack_exports__,__webpack_require__){"use strict";eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _dbhelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dbhelper */ \"./app/assets/scripts/dbhelper.js\");\n\n\nlet restaurants,\n  neighborhoods,\n  cuisines;\nlet map;\nmarkers = [];\n\n/*\n * Fetch neighborhoods and cuisines as soon as the page is loaded.\n */\ndocument.addEventListener('DOMContentLoaded', (event) => {\n  fetchNeighborhoods();\n  fetchCuisines();\n});\n\n/* Fetch all neighborhoods and set their HTML. */\nfetchNeighborhoods = () => {\n  _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fetchNeighborhoods((error, neighborhoods) => {\n    if (error) { // Got an error\n      console.error(error);\n    } else {\n      self.neighborhoods = neighborhoods;\n      fillNeighborhoodsHTML();\n    }\n  });\n}\n\n/* Set neighborhoods HTML.*/\nfillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {\n  const select = document.getElementById('neighborhoods-select');\n  neighborhoods.forEach(neighborhood => {\n    const option = document.createElement('option');\n    option.innerHTML = neighborhood;\n    option.value = neighborhood;\n    select.append(option);\n  });\n}\n\n/* Fetch all cuisines and set their HTML.*/\nfetchCuisines = () => {\n  _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fetchCuisines((error, cuisines) => {\n    if (error) { // Got an error!\n      console.error(error);\n    } else {\n      self.cuisines = cuisines;\n      fillCuisinesHTML();\n    }\n  });\n}\n\n/*\n * Set cuisines HTML.\n */\nfillCuisinesHTML = (cuisines = self.cuisines) => {\n  const select = document.getElementById('cuisines-select');\n\n  cuisines.forEach(cuisine => {\n    const option = document.createElement('option');\n    option.innerHTML = cuisine;\n    option.value = cuisine;\n    select.append(option);\n  });\n}\n\n/*\n * Initialize Google map, called from HTML.\n */\nwindow.initMap = () => {\n  let loc = {\n    lat: 40.722216,\n    lng: -73.987501\n  };\n  self.map = new google.maps.Map(document.getElementById('map'), {\n    zoom: 12,\n    center: loc,\n    scrollwheel: false\n  });\n  updateRestaurants();\n}\n\n/*\n * Update page and map for current restaurants.\n */\nupdateRestaurants = () => {\n  const cSelect = document.getElementById('cuisines-select');\n  const nSelect = document.getElementById('neighborhoods-select');\n\n  const cIndex = cSelect.selectedIndex;\n  const nIndex = nSelect.selectedIndex;\n\n  const cuisine = cSelect[cIndex].value;\n  const neighborhood = nSelect[nIndex].value;\n\n  _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {\n    if (error) { // Got an error!\n      console.error(error);\n    } else {\n      resetRestaurants(restaurants);\n      fillRestaurantsHTML();\n    }\n  })\n}\n\n/*\n * Clear current restaurants, their HTML and remove their map markers.\n */\nresetRestaurants = (restaurants) => {\n  // Remove all restaurants\n  self.restaurants = [];\n  const ul = document.getElementById('restaurants-list');\n  ul.innerHTML = '';\n\n  // Remove all map markers\n  self.markers.forEach(m => m.setMap(null));\n  self.markers = [];\n  self.restaurants = restaurants;\n}\n\n/*\n * Create all restaurants HTML and add them to the webpage.\n */\nfillRestaurantsHTML = (restaurants = self.restaurants) => {\n  const ul = document.getElementById('restaurants-list');\n  restaurants.forEach(restaurant => {\n    ul.append(createRestaurantHTML(restaurant));\n  });\n  addMarkersToMap();\n}\n\n/*\n * Create restaurant HTML.\n */\ncreateRestaurantHTML = (restaurant) => {\n  const li = document.createElement('li');\n  const image = document.createElement('img');\n  image.className = 'restaurant-img';\n  image.src = _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].imageUrlForRestaurant(restaurant);\n  image.setAttribute('alt', `Photo of ${restaurant.name} restaurant`);\n  li.append(image);\n\n  const name = document.createElement('h3');\n  name.innerHTML = restaurant.name;\n  li.append(name);\n\n  const neighborhood = document.createElement('address');\n  neighborhood.innerHTML = restaurant.neighborhood;\n  li.append(neighborhood);\n\n  const address = document.createElement('address');\n  address.innerHTML = restaurant.address;\n  li.append(address);\n\n  const more = document.createElement('button');\n  more.innerHTML = 'View Restaurant Details';\n  more.addEventListener('click', () => window.location.href = _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].urlForRestaurant(restaurant));\n  li.append(more);\n  return li;\n}\n\n/*\n * Add markers for current restaurants to the map.\n */\naddMarkersToMap = (restaurants = self.restaurants) => {\n  restaurants.forEach(restaurant => {\n    // Add marker to the map\n    const marker = _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].mapMarkerForRestaurant(restaurant, self.map);\n    google.maps.event.addListener(marker, 'click', () => {\n      window.location.href = marker.url\n    });\n    self.markers.push(marker);\n  });\n}\n\n\n//# sourceURL=webpack:///./app/assets/scripts/app.js?")},"./app/assets/scripts/dbhelper.js":
/*!****************************************!*\
  !*** ./app/assets/scripts/dbhelper.js ***!
  \****************************************/
/*! exports provided: default */function(module,__webpack_exports__,__webpack_require__){"use strict";eval("__webpack_require__.r(__webpack_exports__);\n\r\n// register service worker\r\nif ('serviceWorker' in navigator) {\r\n  navigator.serviceWorker\r\n    .register('./service-worker.js')\r\n    .then(() => console.log('Service Worker Registered'))\r\n    .catch(err => console.log('ServiceWorker registration failed: ', err));\r\n}\r\n\r\n/* Common database helper functions. */\r\nclass DBHelper {\r\n\r\n  /* Fetch all restaurants from the server.*/\r\n   static async fetchRestaurants(callback) {\r\n    const port = 1337; // Change this to your server port\r\n\r\n  try {\r\n      const data = await fetch(`http://localhost:${port}/restaurants`);\r\n      const json = await data.json();\r\n      callback(null, json);\r\n    } catch(err) {\r\n      callback(err, null);\r\n    }\r\n  }\r\n\r\n  /* Fetch a restaurant by its ID. */\r\n  static fetchRestaurantById(id, callback) {\r\n    // fetch all restaurants with proper error handling.\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        const restaurant = restaurants.find(r => r.id == id);\r\n        if (restaurant) { // Got the restaurant\r\n          callback(null, restaurant);\r\n        } else { // Restaurant does not exist in the database\r\n          callback('Restaurant does not exist', null);\r\n        }\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch restaurants by a cuisine type with proper error handling.\r\n   */\r\n  static fetchRestaurantByCuisine(cuisine, callback) {\r\n    // Fetch all restaurants  with proper error handling\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Filter restaurants to have only given cuisine type\r\n        const results = restaurants.filter(r => r.cuisine_type == cuisine);\r\n        callback(null, results);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch restaurants by a neighborhood with proper error handling.\r\n   */\r\n  static fetchRestaurantByNeighborhood(neighborhood, callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Filter restaurants to have only given neighborhood\r\n        const results = restaurants.filter(r => r.neighborhood == neighborhood);\r\n        callback(null, results);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.\r\n   */\r\n  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        let results = restaurants\r\n        if (cuisine != 'all') { // filter by cuisine\r\n          results = results.filter(r => r.cuisine_type == cuisine);\r\n        }\r\n        if (neighborhood != 'all') { // filter by neighborhood\r\n          results = results.filter(r => r.neighborhood == neighborhood);\r\n        }\r\n        callback(null, results);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch all neighborhoods with proper error handling.\r\n   */\r\n  static fetchNeighborhoods(callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Get all neighborhoods from all restaurants\r\n        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)\r\n        // Remove duplicates from neighborhoods\r\n        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)\r\n        callback(null, uniqueNeighborhoods);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch all cuisines with proper error handling.\r\n   */\r\n  static fetchCuisines(callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Get all cuisines from all restaurants\r\n        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)\r\n        // Remove duplicates from cuisines\r\n        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)\r\n        callback(null, uniqueCuisines);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Restaurant page URL.\r\n   */\r\n  static urlForRestaurant(restaurant) {\r\n    return (`./restaurant.html?id=${restaurant.id}`);\r\n  }\r\n\r\n  /**\r\n   * Restaurant image URL.\r\n   */\r\n  static imageUrlForRestaurant(restaurant) {\r\n    return (`assets/images/${restaurant.id}_thumbnail.jpg`);\r\n  }\r\n\r\n  /**\r\n   * Map marker for a restaurant.\r\n   */\r\n  static mapMarkerForRestaurant(restaurant, map) {\r\n    const marker = new google.maps.Marker({\r\n      position: restaurant.latlng,\r\n      title: restaurant.name,\r\n      url: DBHelper.urlForRestaurant(restaurant),\r\n      map: map,\r\n      animation: google.maps.Animation.DROP}\r\n    );\r\n    return marker;\r\n  }\r\n}\r\n\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (DBHelper);\n\n//# sourceURL=webpack:///./app/assets/scripts/dbhelper.js?")}});