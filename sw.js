/* Stay Strong service worker — precache the app shell so it works offline in the gym.
 *
 * Only the small app shell is cached at install (so a new version activates in
 * seconds even on a weak signal). Demo photos live in a separate, persistent
 * cache that the page fills in the background and that the fetch handler
 * tops up on demand. */

const VERSION = 26;                       // keep in step with APP_VERSION in js/app.js
const CACHE = `staystrong-v${VERSION}`;
const PHOTO_CACHE = 'staystrong-photos';  // demo photos + animated clips; survives version bumps
const ASSETS = [
  './',
  './index.html',
  `./css/styles.css?v=${VERSION}`,
  `./js/exercises.js?v=${VERSION}`,
  `./js/demos.js?v=${VERSION}`,
  `./js/anims.js?v=${VERSION}`,
  `./js/videos.js?v=${VERSION}`,
  `./js/icons.js?v=${VERSION}`,
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

  const isMedia = request.url.includes('/img/demo/') || request.url.includes('/img/anim/');
  if (isMedia) { event.respondWith(mediaResponse(request)); return; }
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((resp) => {
      if (resp.ok) {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return resp;
    }))
  );
});

/* Photos and clips: cache-first from the persistent media cache, fetched whole
 * and stored on first use. Video elements ask for byte ranges (iOS insists on
 * a 206 answer), so ranges are sliced out of the cached file here. */
async function mediaResponse(request) {
  const url = request.url;
  const cache = await caches.open(PHOTO_CACHE);
  let full = await cache.match(url);
  if (!full) {
    full = await fetch(url);                  // whole file, no Range, so the cache gets all of it
    if (!full.ok) return full;
    await cache.put(url, full.clone());
  }
  const range = request.headers.get('range');
  if (!range) return full;
  const buf = await full.clone().arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range) || [];
  const start = m[1] ? Number(m[1]) : 0;
  const end = m[2] ? Math.min(Number(m[2]), buf.byteLength - 1) : buf.byteLength - 1;
  const slice = buf.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      'Content-Type': full.headers.get('Content-Type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(slice.byteLength),
      'Accept-Ranges': 'bytes',
    },
  });
}
