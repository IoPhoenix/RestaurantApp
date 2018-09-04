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
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      console.log('From fetchRestaurantById, self.restaurant is: ', self.restaurant);
      console.log('From fetchRestaurantById, restaurant is: ', restaurant);
      if (!restaurant) {
        console.error(error);
        return;
      }
      DBHelper.fetchReviewsByRestaurantId(id);
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

  // fillReviewsHTML(DBHelper.fetchReviewsByRestaurantId(restaurant.id));
  fillReviewsHTML(restaurant.id);
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
const fillReviewsHTML = (id) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  DBHelper.getStoredObjectById('reviews', 'restaurant', id)
    .then(storedReviews => {
      console.log('fetching reviews from idb...');
      // Promise.resolve(storedReviews);
      const ul = document.getElementById('reviews-list');
      storedReviews.forEach(review => ul.appendChild(createReviewHTML(review)))
      container.appendChild(ul);
    })
    .catch(err => {
      console.log('Error fetching reviews from idb: ', err);
      const noReviews = document.createElement('h2');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    });
}

/* Create review HTML and add it to the webpage */
const createReviewHTML = (review) => {
    const li = document.createElement('li');
    const name = document.createElement('h3');
    name.innerHTML = review.name;
    li.appendChild(name);

    const date = document.createElement('em');
    date.innerHTML = Date(review.createdAt);
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