const CACHE_NAME = "mtal-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./87348b3b-97a8-4fe6-a8e9-cca8434bad69.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
