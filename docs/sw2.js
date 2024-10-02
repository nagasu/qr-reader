var CACHE_DYNAMIC_VERSION = 'dynamic-v2';

const STATIC_DATA = [
    '/index.html',
    '/favicon.ico',
];

self.addEventListener('install', function(e) {
    console.log('[sw] install')
    e.waitUntil(
        caches.open('cache_v1').then(function(cache) {
            return cache.addAll(STATIC_DATA);
        })
    );
});

self.addEventListener('fetch', event => {
    console.log('[sw] fetch request', event.request);
    event.respondWith(
        // キャッシュの存在チェック
        caches.match(event.request)
            .then(response => {
                console.log('[sw] fetch response', response);

                if (response) {
                    console.log('[sw] fetch response hit');
                    return response;
                } else {
                    console.log('[sw] fetch response nothing');
                    // キャッシュがなければリクエストを投げて、レスポンスをキャッシュに入れる
                    return fetch(event.request)
                        .then(res => {
                            return caches.open(CACHE_DYNAMIC_VERSION)
                                .then(cache => {
                                    // 最後に res を返せるように、ここでは clone() する必要がある
                                    console.log('[sw] fetch response cache start', res.clone());
                                    cache.put(event.request.url, res.clone());
                                    console.log('[sw] fetch response cache end');
                                    return res;
                                })
                        })
                        .catch(() => {});
                }
            })
    );
});
