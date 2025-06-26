const CACHE_NAME = 'bodor-manual-v1';
const urlsToCache = [
  '/bodor-digital-manual/',
  '/bodor-digital-manual/index.html',
  // 必要に応じて他のファイルも追加
  // '/bodor_digital_manual/style.css',
  // '/bodor_digital_manual/script.js',
];

// Service Worker インストール時
self.addEventListener('install', event => {
  console.log('Service Worker: インストール中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: ファイルをキャッシュ中...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: インストール完了');
        return self.skipWaiting();
      })
  );
});

// Service Worker アクティベート時
self.addEventListener('activate', event => {
  console.log('Service Worker: アクティベート中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: 古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: アクティベート完了');
      return self.clients.claim();
    })
  );
});

// ネットワークリクエスト時
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにあればそれを返す、なければネットワークから取得
        if (response) {
          console.log('Service Worker: キャッシュから取得:', event.request.url);
          return response;
        }
        
        console.log('Service Worker: ネットワークから取得:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // レスポンスが有効かチェック
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});
