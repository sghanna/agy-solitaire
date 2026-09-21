/**
 * agy-solitaire: Service Worker (Cache-First Offline Play)
 */

const CACHE_NAME = 'agy-solitaire-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/deck.js',
  './js/audio.js',
  './js/celebration.js',
  './js/game.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
