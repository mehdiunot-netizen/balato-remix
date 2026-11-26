const CACHE = 'contre-pli-23';
const assets = ['./', './index.html', './style.css?v=23', './app.mjs?v=23', './game.mjs?v=23',
  './jokers.mjs?v=18', './manifest.webmanifest', './emblem.svg', './touch.png', './art/observatoire.jpg', './art/figures.jpg', './art/emblemes.jpg', './art/augures.jpg'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(assets)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('contre-pli-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
