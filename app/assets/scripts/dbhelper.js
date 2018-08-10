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

const createDB = () => {
    const dbPromise = idb.open('restaurants', 1, function(upgradeDB) {
      upgradeDB.createObjectStore('restaurants');
    }).then(console.log('Database created!'));

    return dbPromise;
}
 
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
      const port = 1337; // Change this to your server port
      return `http://localhost:${port}/restaurants`;
    }
  
    /**
     * Fetch all restaurants.
     */
    static async fetchRestaurants(callback) {
      try {
        const data = await fetch(DBHelper.DATABASE_URL);
        const json = await data.json();
        console.log('Data from server: ', json);
        callback(null, json);

        // if data is successfully returned from the server
        // and the database does not exist, create new database and
        // store data in it
        createDB().then(function(db) {
              const tx = db.transaction('restaurants', 'readwrite');
              const restaurantsStore = tx.objectStore('restaurants');
              
              json.forEach(r => restaurantsStore.put(r, r.id));
              return tx.cemplete;
        })
        .then(console.log('Added restaurants info to idb!'))
        .catch(err => console.log('Could not add restaurants to idb: ', err));


      } catch(err) {
        // callback(err, null);

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
  
    /**
     * Fetch a restaurant by its ID.
     */
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
    //  static mapMarkerForRestaurant(restaurant, map) {
    //   // https://leafletjs.com/reference-1.3.0.html#marker  
    //   const marker = L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
    //     {title: restaurant.name,
    //     alt: restaurant.name,
    //     url: DBHelper.urlForRestaurant(restaurant)
    //     })
    //     marker.addTo(newMap);
    //   return marker;
    // } 
   static mapMarkerForRestaurant(restaurant, map) {
      const marker = new google.maps.Marker({
        position: restaurant.latlng,
        title: restaurant.name,
        url: DBHelper.urlForRestaurant(restaurant),
        map: map,
        animation: google.maps.Animation.DROP}
      );
      return marker;
    }
  
  }