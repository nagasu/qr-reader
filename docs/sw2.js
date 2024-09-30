const STATIC_DATA = [
    'index.html',
    '/css/normalize.css',
    '/css/main.css',
    '/js/sample.js',
    '/js/jsQR.js',
    '/js/howler.min.js',
    '/js/app.js',
    // "/assets/english1.ogg",
    // "/assets/english1.m4a",
    // "/assets/english1.mp3",
  ];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open('cache_v1').then(function(cache) {
            return cache.addAll(STATIC_DATA);
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log(event.request.url);

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
