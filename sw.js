const staticCacheName = 'pages-cache-v1';
const filesToCache = [
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
//process Messages (update)
self.addEventListener('message', event =>
{
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});