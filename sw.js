const staticCacheName = 'pages-cache-v1';
const filesToCache = [
    "https://use.fontawesome.com/releases/v5.4.1/css/all.css",
    "https://unpkg.com/leaflet@1.3.1/dist/leaflet.css",
    "https://code.jquery.com/jquery-3.3.1.min.js",
    "https://unpkg.com/leaflet@1.3.1/dist/leaflet.js",
    "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/js/toastr.min.js",
    "/js/dbhelper.js",
    "/js/main.js",
    "/js/restaurant_info.js",
    "https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css",
    "/js/serviceWorker.js",
];

//Install
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(staticCacheName)
        .then(cache => {
            return cache.addAll(filesToCache);
        })
    );
});
//Clear on activate
self.addEventListener('activate', event => {

    const cacheWhitelist = [staticCacheName];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
//Fetch
self.addEventListener('fetch',
    function(event) {
        let requestUrl = new URL(event.request.url);
        if (requestUrl.pathname.startsWith('/restaurant.html')) {
            let splitUrl = requestUrl.href.split("?")[0];
            return caches.open(staticCacheName).then(function(cache) {
                return cache.match(splitUrl).then(function(response) {
                    if (response) return response;

                    return fetch(request).then(function(response) {
                        cache.put(splitUrl, response.clone());
                        return response;
                    });
                });
            });
        };
        if (event.request.method !== 'GET') return;
        event.respondWith(
            caches.match(event.request).then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request).then(function(response) {
                    if (response.status === 200) {
                        return caches.open(staticCacheName).then(function(cache) {
                            cache.put(event.request.url, response.clone());
                            return response;
                        });
                    }
                    return response;
                });
            })
        );
    });
//process Messages (update)
self.addEventListener('message', event =>
{
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});