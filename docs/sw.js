var CACHE_VERSION = "qr-reader-v0.1.0";

const CACHE_KEYS = [CACHE_VERSION];

const STATIC_DATA = [
  "./assets/english1.ogg",
  "./assets/english1.m4a",
  "./assets/english1.mp3",
  "./css/app.css",
  "./images/icons/apple-touch-icon.png",
  "./js/app.js",
  "./js/howler.min.js",
  "./js/jsQR.js",
  "./index.html",
  "./favicon.ico",
];

self.addEventListener("install", function (e) {
  console.log("[sw] install");
  e.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      self.skipWaiting();
      return cache.addAll(STATIC_DATA);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("[sw] activate");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => {
            return !CACHE_KEYS.includes(key);
          })
          .map((key) => {
            console.log("[sw] cache key delete", key);
            return caches.delete(key);
          })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  // console.log('[sw] fetch request', event.request);
  const url = event.request.url;

  if (url.startsWith("chrome-extension") || url.includes("extension")) {
    // console.log('[sw] fetch request skip', event.request.url);
    return;
  }

  event.respondWith(
    // キャッシュの存在チェック
    caches.match(event.request).then((response) => {
      // console.log('[sw] fetch response', response);

      if (response) {
        // console.log('[sw] fetch response hit');
        return response;
      } else {
        // console.log('[sw] fetch response nothing');
        return fetch(event.request)
          .then((res) => {
            return caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request.url, res.clone());
              return res;
            });
          })
          .catch(() => {});
      }
    })
  );
});
