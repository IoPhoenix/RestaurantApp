'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      if (request) {
        request.onupgradeneeded = function(event) {
          if (upgradeCallback) {
            upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
          }
        };
      }

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
    module.exports.default = module.exports;
  }
  else {
    self.idb = exp;
  }
}());

/* Common database helper functions. */

 // register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.log('ServiceWorker registration failed: ', err));
}
 


class DBHelper {

  static get DATABASE_URL() {
    const port = 1337; // server port
    return `http://localhost:${port}/`;
  }
  
    // handle relevant IndexedDB creation:
    static dbPromise() {
      return idb.open('db', 2, function(upgradeDB) {
        switch(upgradeDB.oldVersion) {
          case 0:
            upgradeDB.createObjectStore('restaurants', {
              keyPath: 'id'
            });
          case 1:
            const reviewsStore = upgradeDB.createObjectStore('reviews', {
              keyPath: 'id'
            });
            // create an index for the reviews relative to restaurant ID
            reviewsStore.createIndex('restaurant', 'restaurant_id');
        }
      })
    }


    /**
     * Fetch all restaurants.
     */
    static async fetchRestaurants(callback) {
      try {
        const data = await fetch(`${DBHelper.DATABASE_URL}restaurants`);
        const json = await data.json();
        callback(null, json);
        
        // if data is successfully returned from the server,
        // create new database and store data in it
       this.dbPromise()
          .then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantsStore = tx.objectStore('restaurants');
            
            json.forEach(restaurant => restaurantsStore.put(restaurant));
            return tx.cemplete.then(() => Promise.resolve(json));
          })
          .catch(err => console.log('Could not add restaurants to idb: ', err));


      } catch(err) {
        console.log('Error with the network, you are offline');

        // if app is offline, fetch restaurants from IndexedDB database:
        this.dbPromise().then(db => {
          if (!db) return;

          const store = db.transaction('restaurants').objectStore('restaurants');
          return store.getAll();
        }).then(storedRestaurants => {
            console.log('Data read from idb while offline: ', storedRestaurants);
            callback(null, storedRestaurants);
        }).catch(error => callback(error, null));
      }
    }
  
    /* Fetch a restaurant by its ID. */
    static fetchRestaurantById(id, callback) {

      // fetch all restaurants with proper error handling.
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          const restaurant = restaurants.find(r => r.id == id);
          if (restaurant) { // Got the restaurant
            callback(null, restaurant);
          } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
          }
        }
      });
    }
  
    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
      // Fetch all restaurants  with proper error handling
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given cuisine type
          const results = restaurants.filter(r => r.cuisine_type == cuisine);
          callback(null, results);
        }
      });
    }
  
    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Filter restaurants to have only given neighborhood
          const results = restaurants.filter(r => r.neighborhood == neighborhood);
          callback(null, results);
        }
      });
    }
  
    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          let results = restaurants
          if (cuisine != 'all') { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine);
          }
          if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood);
          }
          callback(null, results);
        }
      });
    }
  
    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all neighborhoods from all restaurants
          const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
          // Remove duplicates from neighborhoods
          const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
          callback(null, uniqueNeighborhoods);
        }
      });
    }
  
    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
      // Fetch all restaurants
      DBHelper.fetchRestaurants((error, restaurants) => {
        if (error) {
          callback(error, null);
        } else {
          // Get all cuisines from all restaurants
          const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
          // Remove duplicates from cuisines
          const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
          callback(null, uniqueCuisines);
        }
      });
    }
  
    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
      return (`./restaurant.html?id=${restaurant.id}`);
    }
  
    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
      return (`assets/images/${restaurant.id}_thumbnail.webp`);
    }
  
 /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(self.newMap);
    return marker;
  } 

  static updateFavoriteStatus(restaurantId, isFavorite) {
    console.log('Updating status to: ', isFavorite);

    fetch(`${DBHelper.DATABASE_URL}restaurants/${restaurantId}/?is_favorite=${isFavorite}`, {
      method: 'PUT'
    })
    .then(() => {
      console.log('favorite status changed in database!');
      // update data in IndexedDB:
      this.dbPromise()
        .then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');
          store.get(restaurantId)
            .then(restaurant => {
              restaurant.is_favorite = isFavorite;
              store.put(restaurant);
            })
            .then(console.log('Favorite status updated in IndexedDB'))
            .catch(err => console.log('Could not get requested restaurant from IndexedDB: ', err));
        })
    })
    .catch(err => console.log('Error updating favorite restaurant in database: ', err));
  }



  static getStoredObjectById(table, idx, id) {
    return this.dbPromise()
      .then(db => {
        if (!db) return;

        const store = db.transaction(table).objectStore(table);
        const indexId = store.index(idx);
        return indexId.getAll(id);
      });
  }



  static async fetchReviewsByRestaurantId(id) {
    // fetch reviews from the server:
    try {
      const data = await fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`);
      const reviews = await data.json();

      this.dbPromise().then(db => {
          if (!db) return;

          // store reviews in IndexedDB:
          let tx = db.transaction('reviews', 'readwrite');
          const store = tx.objectStore('reviews');
          if (Array.isArray(reviews)) {
            reviews.forEach(review => store.put(review));
          } else {
            store.put(reviews);
          }
        })
        .catch(err => console.log('Could not add reviews to idb: ', err));

        // Return the list of reviews:
        return Promise.resolve(reviews);
      } catch(err) {
          // if offline, take reviews from IndexedDB:
          return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
            .then(storedReviews => {
              console.log('looking for offline stored reviews');
              return Promise.resolve(storedReviews);
          });
      }
  } 

  static addReview(review) {

    // clear previous error messages:
    document.getElementById('form-error').innerText = '';

    // create an object for offline storage:
    const offilineObject = {
      name: 'addReview',
      data: review,
      objectType: 'review'
    };

    // check if online. If offline, store data in local storage,
    // send it to server when back online
    if (!navigator.onLine && (offilineObject.name === 'addReview')) {
      DBHelper.sendDataWhenOnline(offilineObject);
      return;
    }

    const reviewToSend = {
      "name": review.name,
      "rating": parseInt(review.rating),
      "comments": review.comments,
      "restaurant_id": parseInt(review.restaurant_id)
    };

    console.log('Sending review: ', reviewToSend);

    const fetchOptions = {
      method: 'POST',
      body: JSON.stringify(reviewToSend),
      headers: new Headers({ 
        'Content-Type': 'application/json'
      })
    };

    fetch(`${DBHelper.DATABASE_URL}reviews`, fetchOptions)
      .then(response => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return response.json();
        } else {
          return 'API call successfull';
        }
      })
      .then(data => console.log('Review was successfully sent to server!'))
      .catch(err => console.log(err));
  }
  

  static sendDataWhenOnline(offlineObject) {
    console.log('Object to store: ', offlineObject);
    // store new local in the local storage for future use:
    localStorage.setItem('data', JSON.stringify(offlineObject.data));
    console.log(`Local storage: ${offlineObject.objectType} is stored!`);

    // wait until the user is back online,
    // then retrieve stored review from local storage:
    window.addEventListener('online', (event) => {
      console.log('Browser: online again!');
      const data = JSON.parse(localStorage.getItem('data'));
      console.log('Updating and cleaning ui...');
      [...document.querySelectorAll('.review-offline')].forEach(review => {
        review.classList.remove('review-offline');
        review.querySelector('.offline-label').remove();
      });

      if (data !== null) {
        console.log('From sendDataWhenOnline, data is: ', data);
        if (offlineObject.name === 'addReview') {
          // send review to the server:
          DBHelper.addReview(offlineObject.data);
        }

        console.log('Review from local storage sent to server');

        // clear local storage:
        localStorage.removeItem('data');
        console.log(`Local Storage: ${offlineObject.objectType} removed!`);
      }
    });
  }
}
let restaurant;
var newMap;


document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});


/* Initialize leaflet map */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoiaW9waG9lbml4IiwiYSI6ImNqa29peG82NzFtZHkzcXBjdm9mbmN2ZWkifQ.80oAZqBb8GPBVoI8xFZucA',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    const error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.getElementById('restaurant-image');
  const caption = document.getElementById('restaurant-caption');
  const image =
            `<source media="(min-width: 992px)" srcset="assets/images/${restaurant.id}_large_2x.webp 2x, assets/images/${restaurant.id}_large_1x.webp">
              <source media="(min-width: 768px)" srcset="assets/images/${restaurant.id}_medium.webp 445w">
              <source media="(min-width: 480px)" srcset="assets/images/${restaurant.id}_small.webp 540w">
              <img class="restaurant-img" id="restaurant-img" src="assets/images/${restaurant.id}_extra-small.webp" alt="Photo of ${restaurant.name} restaurant">`;

  picture.innerHTML = image;
  caption.innerHTML =  `Photo of ${restaurant.name}`;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  // fetch reviews and add them to IndexedDB:
  const reviewsPromise = DBHelper.fetchReviewsByRestaurantId(restaurant.id);
  reviewsPromise.then(function(reviews) {
    fillReviewsHTML(reviews);
  });
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/* Create all reviews HTML and add them to the webpage.*/
const fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}


/* Create review HTML and add it to the webpage */
const createReviewHTML = (review) => {
    const li = document.createElement('li');

    const name = document.createElement('h3');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('em');
    date.innerHTML = new Date(review.createdAt).toLocaleString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.classList.add('restaurant-rating');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);
    
    return li;
}

const addNewReviewHtml = (newReview) => {
    const li = createReviewHTML(newReview);

    if (!navigator.onLine) {
      const connectionStatus = document.createElement('div');
      connectionStatus.classList.add('offline-label');
      connectionStatus.innerHTML = 'Offline';
      li.classList.add('review-offline');
      li.appendChild(connectionStatus);
    }
    
    document.getElementById('reviews-list').appendChild(li);
}

/* Add restaurant name to the breadcrumb navigation menu */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const link = document.createElement('a');
  link.innerHTML = restaurant.name;
  link.href = window.location.href;
  link.classList.add('active-page');
  li.appendChild(link);
  breadcrumb.appendChild(li);
}

/* Get a parameter by name from page URL. */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


  // validate form
  const addReview = () => {
    console.log('Form is submitted!');

    event.preventDefault();
    let restaurantId = getParameterByName('id');
    let name = document.getElementById('review-author');
    let comments = document.getElementById('review-comments');
    let rating = document.querySelector('#select-rating option:checked').value; 

    const nameIsValid = name.value !== '';
    const commentsAreValid = comments.value !== '';

    if (!nameIsValid || !commentsAreValid) {
      document.getElementById('form-error').innerText = 'Please fill in the form!';
      name.setAttribute('aria-invalid', !nameIsValid);
      comments.setAttribute('aria-invalid', !commentsAreValid);
      return;
    }

    const review = [name.value, restaurantId, rating, comments.value];  
    console.log('review is: ', review);

    const validatedReview = {
      restaurant_id: parseInt([review[1]]),
      rating: parseInt(review[2]),
      name: review[0].trim(),
      comments: review[3].trim().substring(0, 300),
      createdAt: new Date()
    }

    console.log('From addReview, validatedReview is: ', validatedReview);

    //  send review to the server and add new review to the website:
    DBHelper.addReview(validatedReview);
    addNewReviewHtml(validatedReview);
    document.getElementById('review-form').reset();
  }
// toggle menu on smaller screens
    const menuToggler = document.getElementById('menu-toggler');
    let isMenuOpen = false;

    menuToggler.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        menuToggler.setAttribute('aria-expanded', isMenuOpen);
    });
