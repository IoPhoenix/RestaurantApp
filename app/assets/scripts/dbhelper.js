/**
 * Common database helper functions.
 */

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
            console.log('upgradeDB.oldVersion: ', upgradeDB.oldVersion);
            upgradeDB.createObjectStore('restaurants', {
              keyPath: 'id'
            });
          case 1:
            console.log('upgradeDB.oldVersion: ', upgradeDB.oldVersion);
            const reviewsStore = upgradeDB.createObjectStore('reviews', {
              keyPath: 'id'
            });
            // create an index for the reviews relative to restaurant ID
            reviewsStore.createIndex('restaurant', 'restaurant_id');
          default:
            console.log('upgradeDB.oldVersion: ', upgradeDB.oldVersion);
            return;

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
        console.log('restaurant data returned from server: ', json);
        callback(null, json);
        
        // if data is successfully returned from the server,
        // create new database and store data in it
       this.dbPromise()
          .then(console.log('Database created!'))
          .then(db => {
            const tx = db.transaction('restaurants', 'readwrite');
            const restaurantsStore = tx.objectStore('restaurants');
            
            json.forEach(restaurant => restaurantsStore.put(restaurant));
            return tx.cemplete.then(() => Promise.resolve(json));
          })
          .then(console.log('Added restaurants info to idb!'))
          .catch(err => console.log('Could not add restaurants to idb: ', err));


      } catch(err) {
        console.log('Error with the network, you are offline');

         // if app is offline, fetch restaurants from the IndexedDB database:
        idb.open('restaurants', 1).then(function(db) {
          const tx = db.transaction(['restaurants'], 'readonly');
          const store = tx.objectStore('restaurants');
          return store.getAll();
        }).then(function(restaurants) {
            console.log('Data read from idb: ', restaurants);
           callback(null, restaurants);
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
          console.log("from fetchRestaurantById, restaurant is: ", restaurant);
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

    fetch(`${DBHelper.DATABASE_URL}/restaurants/${restaurantId}/?is_favorite=${isFavorite}`, {
      method: 'PUT'
    })
    .then(() => {
      console.log('favorite status changed in database!');
      // update data in IndexedDB:
      this.dbPromise()
        .then(db => {
          console.log('From updateFavoriteStatus, db: ', db);
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
        .then(console.log('Added reviews info to idb!'))
        .catch(err => console.log('Could not add reviews to idb: ', err));

        // Return the list of reviews:
        return Promise.resolve(reviews);
      } catch(err) {
          console.log('From fetchReviewsByRestaurantId, error: ', err);
          // if offline, take reviews from IndexedDB:
          return DBHelper.getStoredObjectById('reviews', 'restaurant', id)
            .then(storedReviews => {
              console('looking for offline stored reviews');
              Promise.resolve(storedReviews);
          })  
      }
  } 

  static addReview(review) {
    // create an object for offline storage:
    const offilineObject = {
      name: 'addReview',
      data: review,
      object_type: 'review'
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
        console.log('from addReview, response from server: ', response);
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return response.json();
        } else {
          return 'API call successfull';
        }
      })
      .then(data => console.log('Fetch successful'))
      .catch(err => console.log(err));
  }
}