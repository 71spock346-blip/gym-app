/* Stay Strong service worker — precache the app shell so it works offline in the gym.
 *
 * Only the small app shell is cached at install (so a new version activates in
 * seconds even on a weak signal). Demo photos live in a separate, persistent
 * cache that the page fills in the background and that the fetch handler
 * tops up on demand. */

const VERSION = 20;                       // keep in step with APP_VERSION in js/app.js
const CACHE = `staystrong-v${VERSION}`;
const PHOTO_CACHE = 'staystrong-photos';  // survives version bumps
const ASSETS = [
  './',
  './index.html',
  `./css/styles.css?v=${VERSION}`,
  `./js/exercises.js?v=${VERSION}`,
  `./js/demos.js?v=${VERSION}`,
  `./js/videos.js?v=${VERSION}`,
  `./js/app.js?v=${VERSION}`,
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k !== CACHE && k !== PHOTO_CACHE)
        .map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Navigations: network-first (so updates land when online), cached shell offline.
 * Photos: cache-first from the photo cache, fetched + stored on demand.
 * Everything else: cache-first, stored on demand. */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return resp;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  const isPhoto = request.url.includes('/img/demo/');
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((resp) => {
      if (resp.ok) {
        const copy = resp.clone();
        caches.open(isPhoto ? PHOTO_CACHE : CACHE).then((cache) => cache.put(request, copy));
      }
      return resp;
    }))
  );
});
