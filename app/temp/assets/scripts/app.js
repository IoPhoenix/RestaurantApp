!function(n){var e={};function r(t){if(e[t])return e[t].exports;var o=e[t]={i:t,l:!1,exports:{}};return n[t].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=n,r.c=e,r.d=function(n,e,t){r.o(n,e)||Object.defineProperty(n,e,{enumerable:!0,get:t})},r.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},r.t=function(n,e){if(1&e&&(n=r(n)),8&e)return n;if(4&e&&"object"==typeof n&&n&&n.__esModule)return n;var t=Object.create(null);if(r.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var o in n)r.d(t,o,function(e){return n[e]}.bind(null,o));return t},r.n=function(n){var e=n&&n.__esModule?function(){return n.default}:function(){return n};return r.d(e,"a",e),e},r.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},r.p="",r(r.s="./app/assets/scripts/app.js")}({"./app/assets/scripts/app.js":
/*!***********************************!*\
  !*** ./app/assets/scripts/app.js ***!
  \***********************************/
/*! no exports provided */function(module,__webpack_exports__,__webpack_require__){"use strict";eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _dbhelper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dbhelper */ \"./app/assets/scripts/dbhelper.js\");\n\n\nclass Main {\n  constructor() {\n    this.restaurants = [];\n    this.neighborhoods = [];\n    this.cuisines = [];\n    this.markers = [];\n    this.map = null;\n  }\n\n  /* Fetch all neighborhoods and set their HTML. */\n  fetchNeighborhoods() {\n    _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fetchNeighborhoods((error, neighborhoods) => {\n      if (error) { // Got an error\n        console.error(error);\n      } else {\n        this.neighborhoods = neighborhoods;\n        this.fillNeighborhoodsHTML();\n      }\n    });\n  }\n\n  /* Set neighborhoods HTML.*/\n  fillNeighborhoodsHTML(neighborhoods = this.neighborhoods) {\n    const select = document.getElementById('neighborhoods-select');\n    neighborhoods.forEach(neighborhood => {\n      const option = document.createElement('option');\n      option.innerHTML = neighborhood;\n      option.value = neighborhood;\n      select.append(option);\n    });\n  }\n\n  /* Fetch all cuisines and set their HTML.*/\n  fetchCuisines() {\n    _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fetchCuisines((error, cuisines) => {\n      if (error) { // Got an error!\n        console.error(error);\n      } else {\n        this.cuisines = cuisines;\n        this.fillCuisinesHTML();\n      }\n    });\n  }\n\n  /*\n  * Set cuisines HTML.\n  */\n  fillCuisinesHTML(cuisines = this.cuisines) {\n    const select = document.getElementById('cuisines-select');\n\n    cuisines.forEach(cuisine => {\n      const option = document.createElement('option');\n      option.innerHTML = cuisine;\n      option.value = cuisine;\n      select.append(option);\n    });\n  }\n  /*\n  * Update page and map for current restaurants.\n  */\n  updateRestaurants() {\n    const cSelect = document.getElementById('cuisines-select');\n    const nSelect = document.getElementById('neighborhoods-select');\n\n    const cIndex = cSelect.selectedIndex;\n    const nIndex = nSelect.selectedIndex;\n\n    const cuisine = cSelect[cIndex].value;\n    const neighborhood = nSelect[nIndex].value;\n\n    _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {\n      if (error) { // Got an error!\n        console.error(error);\n      } else {\n        this.resetRestaurants(restaurants);\n        this.fillRestaurantsHTML();\n      }\n    })\n  }\n\n  /*\n  * Clear current restaurants, their HTML and remove their map markers.\n  */\n  resetRestaurants(restaurants) {\n    // Remove all restaurants\n    this.restaurants = [];\n    const ul = document.getElementById('restaurants-list');\n    ul.innerHTML = '';\n\n    // Remove all map markers\n    this.markers.forEach(m => m.setMap(null));\n    this.markers = [];\n    this.restaurants = restaurants;\n  }\n\n  /*\n  * Create all restaurants HTML and add them to the webpage.\n  */\n  fillRestaurantsHTML(restaurants = this.restaurants) {\n    const ul = document.getElementById('restaurants-list');\n    restaurants.forEach(restaurant => {\n      ul.append(this.createRestaurantHTML(restaurant));\n    });\n    this.addMarkersToMap();\n  }\n\n  /*\n  * Create restaurant HTML.\n  */\n  createRestaurantHTML(restaurant) {\n    const li = document.createElement('li');\n    const image = document.createElement('img');\n    image.className = 'restaurant-img';\n    image.src = _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].imageUrlForRestaurant(restaurant);\n    image.setAttribute('alt', `Photo of ${restaurant.name} restaurant`);\n    li.append(image);\n\n    const name = document.createElement('h3');\n    name.innerHTML = restaurant.name;\n    li.append(name);\n\n    const neighborhood = document.createElement('address');\n    neighborhood.innerHTML = restaurant.neighborhood;\n    li.append(neighborhood);\n\n    const address = document.createElement('address');\n    address.innerHTML = restaurant.address;\n    li.append(address);\n\n    const more = document.createElement('button');\n    more.innerHTML = 'View Restaurant Details';\n    more.addEventListener('click', () => window.location.href = _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].urlForRestaurant(restaurant));\n    li.append(more);\n    return li;\n  }\n\n  /*\n  * Add markers for current restaurants to the map.\n  */\n  addMarkersToMap(restaurants = this.restaurants) {\n    restaurants.forEach(restaurant => {\n      // Add marker to the map\n      const marker = _dbhelper__WEBPACK_IMPORTED_MODULE_0__[\"default\"].mapMarkerForRestaurant(restaurant, this.map);\n      google.maps.event.addListener(marker, 'click', () => {\n        window.location.href = marker.url\n      });\n      this.markers.push(marker);\n    });\n  }\n}\n\nconst main = new Main();\n\ndocument.addEventListener('DOMContentLoaded', (event) => {\n  main.fetchNeighborhoods();\n  main.fetchCuisines();\n});\n\n/* Initialize Google map, called from HTML. */\n window.initMap = () => {\n  let loc = {\n    lat: 40.722216,\n    lng: -73.987501\n  };\n  main.map = new google.maps.Map(document.getElementById('map'), {\n    zoom: 12,\n    center: loc,\n    scrollwheel: false\n  });\n  main.updateRestaurants();\n}\n\n//# sourceURL=webpack:///./app/assets/scripts/app.js?")},"./app/assets/scripts/dbhelper.js":
/*!****************************************!*\
  !*** ./app/assets/scripts/dbhelper.js ***!
  \****************************************/
/*! exports provided: default */function(module,__webpack_exports__,__webpack_require__){"use strict";eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var idb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! idb */ \"./node_modules/idb/lib/idb.js\");\n/* harmony import */ var idb__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(idb__WEBPACK_IMPORTED_MODULE_0__);\n\r\n\r\n\r\n// register service worker\r\nif ('serviceWorker' in navigator) {\r\n  navigator.serviceWorker\r\n    .register('./sw.js')\r\n    .then(() => console.log('Service Worker Registered'))\r\n    .catch(err => console.log('ServiceWorker registration failed: ', err));\r\n}\r\n\r\n\r\n/* Common database helper functions. */\r\nclass DBHelper {\r\n\r\n  /* Fetch all restaurants from the server.*/\r\n   static async fetchRestaurants(callback) {\r\n    const port = 1337; // Change this to your server port\r\n\r\n    try {\r\n        const data = await fetch(`http://localhost:${port}/restaurants`);\r\n        const json = await data.json();\r\n        if (callback) callback(null, json);\r\n        // return data so it can be used and stored in service worker:\r\n        return json;\r\n      } catch(err) {\r\n        \r\n         // if app is offline, fetch restaurants from the IndexedDB database:\r\n        idb__WEBPACK_IMPORTED_MODULE_0___default.a.open('restaurants', 1).then(function(db) {\r\n          const tx = db.transaction(['restaurants'], 'readonly');\r\n          const store = tx.objectStore('restaurants');\r\n          return store.getAll();\r\n        }).then(function(restaurants) {\r\n            console.log('Data read from idb: ', restaurants);\r\n            if (callback) callback(null, restaurants);\r\n        }).catch(error => {\r\n          if (callback) callback(error, null);\r\n        });\r\n      }\r\n    }\r\n\r\n\r\n  /* Fetch a restaurant by its ID. */\r\n  static fetchRestaurantById(id, callback) {\r\n    // fetch all restaurants with proper error handling.\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        const restaurant = restaurants.find(r => r.id == id);\r\n        if (restaurant) { // Got the restaurant\r\n          callback(null, restaurant);\r\n        } else { // Restaurant does not exist in the database\r\n          callback('Restaurant does not exist', null);\r\n        }\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch restaurants by a cuisine type with proper error handling.\r\n   */\r\n  static fetchRestaurantByCuisine(cuisine, callback) {\r\n    // Fetch all restaurants  with proper error handling\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Filter restaurants to have only given cuisine type\r\n        const results = restaurants.filter(r => r.cuisine_type == cuisine);\r\n        callback(null, results);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch restaurants by a neighborhood with proper error handling.\r\n   */\r\n  static fetchRestaurantByNeighborhood(neighborhood, callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Filter restaurants to have only given neighborhood\r\n        const results = restaurants.filter(r => r.neighborhood == neighborhood);\r\n        callback(null, results);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.\r\n   */\r\n  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        let results = restaurants\r\n        if (cuisine != 'all') { // filter by cuisine\r\n          results = results.filter(r => r.cuisine_type == cuisine);\r\n        }\r\n        if (neighborhood != 'all') { // filter by neighborhood\r\n          results = results.filter(r => r.neighborhood == neighborhood);\r\n        }\r\n        callback(null, results);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch all neighborhoods with proper error handling.\r\n   */\r\n  static fetchNeighborhoods(callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Get all neighborhoods from all restaurants\r\n        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)\r\n        // Remove duplicates from neighborhoods\r\n        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)\r\n        callback(null, uniqueNeighborhoods);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Fetch all cuisines with proper error handling.\r\n   */\r\n  static fetchCuisines(callback) {\r\n    // Fetch all restaurants\r\n    DBHelper.fetchRestaurants((error, restaurants) => {\r\n      if (error) {\r\n        callback(error, null);\r\n      } else {\r\n        // Get all cuisines from all restaurants\r\n        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)\r\n        // Remove duplicates from cuisines\r\n        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)\r\n        callback(null, uniqueCuisines);\r\n      }\r\n    });\r\n  }\r\n\r\n  /**\r\n   * Restaurant page URL.\r\n   */\r\n  static urlForRestaurant(restaurant) {\r\n    return (`./restaurant.html?id=${restaurant.id}`);\r\n  }\r\n\r\n  /**\r\n   * Restaurant image URL.\r\n   */\r\n  static imageUrlForRestaurant(restaurant) {\r\n    return (`assets/images/${restaurant.id}_thumbnail.webp`);\r\n  }\r\n\r\n  /**\r\n   * Map marker for a restaurant.\r\n   */\r\n  static mapMarkerForRestaurant(restaurant, map) {\r\n    const marker = new google.maps.Marker({\r\n      position: restaurant.latlng,\r\n      title: restaurant.name,\r\n      url: DBHelper.urlForRestaurant(restaurant),\r\n      map: map,\r\n      animation: google.maps.Animation.DROP}\r\n    );\r\n    return marker;\r\n  }\r\n}\r\n\r\n/* harmony default export */ __webpack_exports__[\"default\"] = (DBHelper);\n\n//# sourceURL=webpack:///./app/assets/scripts/dbhelper.js?")},"./node_modules/idb/lib/idb.js":
/*!*************************************!*\
  !*** ./node_modules/idb/lib/idb.js ***!
  \*************************************/
/*! no static exports found */function(module,exports,__webpack_require__){"use strict";eval("\n\n(function() {\n  function toArray(arr) {\n    return Array.prototype.slice.call(arr);\n  }\n\n  function promisifyRequest(request) {\n    return new Promise(function(resolve, reject) {\n      request.onsuccess = function() {\n        resolve(request.result);\n      };\n\n      request.onerror = function() {\n        reject(request.error);\n      };\n    });\n  }\n\n  function promisifyRequestCall(obj, method, args) {\n    var request;\n    var p = new Promise(function(resolve, reject) {\n      request = obj[method].apply(obj, args);\n      promisifyRequest(request).then(resolve, reject);\n    });\n\n    p.request = request;\n    return p;\n  }\n\n  function promisifyCursorRequestCall(obj, method, args) {\n    var p = promisifyRequestCall(obj, method, args);\n    return p.then(function(value) {\n      if (!value) return;\n      return new Cursor(value, p.request);\n    });\n  }\n\n  function proxyProperties(ProxyClass, targetProp, properties) {\n    properties.forEach(function(prop) {\n      Object.defineProperty(ProxyClass.prototype, prop, {\n        get: function() {\n          return this[targetProp][prop];\n        },\n        set: function(val) {\n          this[targetProp][prop] = val;\n        }\n      });\n    });\n  }\n\n  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {\n    properties.forEach(function(prop) {\n      if (!(prop in Constructor.prototype)) return;\n      ProxyClass.prototype[prop] = function() {\n        return promisifyRequestCall(this[targetProp], prop, arguments);\n      };\n    });\n  }\n\n  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {\n    properties.forEach(function(prop) {\n      if (!(prop in Constructor.prototype)) return;\n      ProxyClass.prototype[prop] = function() {\n        return this[targetProp][prop].apply(this[targetProp], arguments);\n      };\n    });\n  }\n\n  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {\n    properties.forEach(function(prop) {\n      if (!(prop in Constructor.prototype)) return;\n      ProxyClass.prototype[prop] = function() {\n        return promisifyCursorRequestCall(this[targetProp], prop, arguments);\n      };\n    });\n  }\n\n  function Index(index) {\n    this._index = index;\n  }\n\n  proxyProperties(Index, '_index', [\n    'name',\n    'keyPath',\n    'multiEntry',\n    'unique'\n  ]);\n\n  proxyRequestMethods(Index, '_index', IDBIndex, [\n    'get',\n    'getKey',\n    'getAll',\n    'getAllKeys',\n    'count'\n  ]);\n\n  proxyCursorRequestMethods(Index, '_index', IDBIndex, [\n    'openCursor',\n    'openKeyCursor'\n  ]);\n\n  function Cursor(cursor, request) {\n    this._cursor = cursor;\n    this._request = request;\n  }\n\n  proxyProperties(Cursor, '_cursor', [\n    'direction',\n    'key',\n    'primaryKey',\n    'value'\n  ]);\n\n  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [\n    'update',\n    'delete'\n  ]);\n\n  // proxy 'next' methods\n  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {\n    if (!(methodName in IDBCursor.prototype)) return;\n    Cursor.prototype[methodName] = function() {\n      var cursor = this;\n      var args = arguments;\n      return Promise.resolve().then(function() {\n        cursor._cursor[methodName].apply(cursor._cursor, args);\n        return promisifyRequest(cursor._request).then(function(value) {\n          if (!value) return;\n          return new Cursor(value, cursor._request);\n        });\n      });\n    };\n  });\n\n  function ObjectStore(store) {\n    this._store = store;\n  }\n\n  ObjectStore.prototype.createIndex = function() {\n    return new Index(this._store.createIndex.apply(this._store, arguments));\n  };\n\n  ObjectStore.prototype.index = function() {\n    return new Index(this._store.index.apply(this._store, arguments));\n  };\n\n  proxyProperties(ObjectStore, '_store', [\n    'name',\n    'keyPath',\n    'indexNames',\n    'autoIncrement'\n  ]);\n\n  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [\n    'put',\n    'add',\n    'delete',\n    'clear',\n    'get',\n    'getAll',\n    'getKey',\n    'getAllKeys',\n    'count'\n  ]);\n\n  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [\n    'openCursor',\n    'openKeyCursor'\n  ]);\n\n  proxyMethods(ObjectStore, '_store', IDBObjectStore, [\n    'deleteIndex'\n  ]);\n\n  function Transaction(idbTransaction) {\n    this._tx = idbTransaction;\n    this.complete = new Promise(function(resolve, reject) {\n      idbTransaction.oncomplete = function() {\n        resolve();\n      };\n      idbTransaction.onerror = function() {\n        reject(idbTransaction.error);\n      };\n      idbTransaction.onabort = function() {\n        reject(idbTransaction.error);\n      };\n    });\n  }\n\n  Transaction.prototype.objectStore = function() {\n    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));\n  };\n\n  proxyProperties(Transaction, '_tx', [\n    'objectStoreNames',\n    'mode'\n  ]);\n\n  proxyMethods(Transaction, '_tx', IDBTransaction, [\n    'abort'\n  ]);\n\n  function UpgradeDB(db, oldVersion, transaction) {\n    this._db = db;\n    this.oldVersion = oldVersion;\n    this.transaction = new Transaction(transaction);\n  }\n\n  UpgradeDB.prototype.createObjectStore = function() {\n    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));\n  };\n\n  proxyProperties(UpgradeDB, '_db', [\n    'name',\n    'version',\n    'objectStoreNames'\n  ]);\n\n  proxyMethods(UpgradeDB, '_db', IDBDatabase, [\n    'deleteObjectStore',\n    'close'\n  ]);\n\n  function DB(db) {\n    this._db = db;\n  }\n\n  DB.prototype.transaction = function() {\n    return new Transaction(this._db.transaction.apply(this._db, arguments));\n  };\n\n  proxyProperties(DB, '_db', [\n    'name',\n    'version',\n    'objectStoreNames'\n  ]);\n\n  proxyMethods(DB, '_db', IDBDatabase, [\n    'close'\n  ]);\n\n  // Add cursor iterators\n  // TODO: remove this once browsers do the right thing with promises\n  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {\n    [ObjectStore, Index].forEach(function(Constructor) {\n      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.\n      if (!(funcName in Constructor.prototype)) return;\n\n      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {\n        var args = toArray(arguments);\n        var callback = args[args.length - 1];\n        var nativeObject = this._store || this._index;\n        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));\n        request.onsuccess = function() {\n          callback(request.result);\n        };\n      };\n    });\n  });\n\n  // polyfill getAll\n  [Index, ObjectStore].forEach(function(Constructor) {\n    if (Constructor.prototype.getAll) return;\n    Constructor.prototype.getAll = function(query, count) {\n      var instance = this;\n      var items = [];\n\n      return new Promise(function(resolve) {\n        instance.iterateCursor(query, function(cursor) {\n          if (!cursor) {\n            resolve(items);\n            return;\n          }\n          items.push(cursor.value);\n\n          if (count !== undefined && items.length == count) {\n            resolve(items);\n            return;\n          }\n          cursor.continue();\n        });\n      });\n    };\n  });\n\n  var exp = {\n    open: function(name, version, upgradeCallback) {\n      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);\n      var request = p.request;\n\n      if (request) {\n        request.onupgradeneeded = function(event) {\n          if (upgradeCallback) {\n            upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));\n          }\n        };\n      }\n\n      return p.then(function(db) {\n        return new DB(db);\n      });\n    },\n    delete: function(name) {\n      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);\n    }\n  };\n\n  if (true) {\n    module.exports = exp;\n    module.exports.default = module.exports;\n  }\n  else {}\n}());\n\n\n//# sourceURL=webpack:///./node_modules/idb/lib/idb.js?")}});