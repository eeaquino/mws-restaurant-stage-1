let restaurants,
    neighborhoods,
    cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded',
    (event) =>
    {
        initMap(); // added 
        fetchNeighborhoods();
        fetchCuisines();
    });

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () =>
{
    DBHelper.fetchNeighborhoods((error, neighborhoods) =>
    {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) =>
{
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood =>
    {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
    });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () =>
{
    DBHelper.fetchCuisines((error, cuisines) =>
    {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) =>
{
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine =>
    {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
    });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () =>
{
    self.newMap = L.map('map',
        {
            center: [40.722216, -73.987501],
            zoom: 12,
            scrollWheelZoom: false
        });
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}',
        {
            mapboxToken: 'sk.eyJ1IjoiZWVhcXVpbm8iLCJhIjoiY2puODdxdjhwMG1hdjNzcWl4Z25idXltYyJ9.aX-T68zle1HPFJPlDL-2mQ',
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapbox.streets'
        }).addTo(newMap);

    updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () =>
{
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine,
        neighborhood,
        (error, restaurants) =>
        {
            if (error) { // Got an error!
                console.error(error);
            } else {
                resetRestaurants(restaurants);
                fillRestaurantsHTML();
            }
        });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) =>
{
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    if (self.markers) {
        self.markers.forEach(marker => marker.remove());
    }
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) =>
{
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant =>
    {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) =>
{
    const li = document.createElement('li');
    li.classList.add("card-2");
    const image = document.createElement('img');
    image.className = 'restaurant-img';
    image.setAttribute("alt", restaurant.name);
    image.src = DBHelper.imageUrlForRestaurant(restaurant);
    li.append(image);

    const rating = document.createElement('div');
    rating.classList.add('restaurant-rate');
    rating.innerHTML = getStars(restaurant.reviews, restaurant.id);
    rating.setAttribute('aria-labelledby', `rating-${restaurant.id}`);
    li.append(rating);

    const innerCont = document.createElement('div');
    innerCont.classList.add('restaurant-cont');

    const more = document.createElement('a');
    more.innerHTML = 'View Details <i class="fas fa-chevron-right" aria-hidden="true"></i>';
    more.href = DBHelper.urlForRestaurant(restaurant);
    more.classList.add('card-1');
    innerCont.append(more);

    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;
    innerCont.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    innerCont.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    innerCont.append(address);

    li.append(innerCont);
    return li;
};

/**
 * Add markers for current restaurants to the map.
 */
getStars = (reviews, id) =>
{
    var stars = reviews.reduce(({ count, sum }, review) =>
        {
            return { count: count + 1, sum: sum + parseFloat(review.rating) };
        },
        { count: 0, sum: 0 });
    let avgStars = Math.round((stars.sum / stars.count) * 2) / 2;
    let fullStars = Math.floor(avgStars);
    let noStar = 5 - Math.ceil(avgStars);
    let html = '';
    for (let c = 0; c < fullStars; c++) {
        html += '<i class="fas fa-star" aria-hidden="true"></i>';
    }
    html += Math.round(avgStars * 10) % 10 !== 0 ? '<i class="fas fa-star-half-alt" aria-hidden="true"></i>' : '';
    for (let c = 0; c < noStar; c++) {
        html += '<i class="far fa-star" aria-hidden="true"></i>';
    }
    html += `<span class="rating-label" id="rating-${id}">${avgStars} Star Rating</span>`;
    return html;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) =>
{
    restaurants.forEach(restaurant =>
    {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
        marker.on("click", onClick);

        function onClick()
        {
            window.location.href = marker.options.url;
        }

        self.markers.push(marker);
    });
}
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */