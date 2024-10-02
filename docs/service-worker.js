self.addEventListener('install', event => {
    event.waitUntil(
      caches.open('qr-reader-cache2').then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/service-worker.js',
          'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
        //   'https://cdn.jsdelivr.net/npm/howler@2.2.3/dist/howler.min.js',
        //   '/assets/english1.mp3'  // 音声ファイルをキャッシュ
        ]);
      })
    );
  });

  self.addEventListener('fetch', event => {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  });
