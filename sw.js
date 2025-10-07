const CACHE_NAME = "mtal-cache-v8"; // sürümü artırman yeterli
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./data.json",
  "./yemek.json",
  "./87348b3b-97a8-4fe6-a8e9-cca8434bad69.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, res.clone());
          return res;
        });
      });
    })
  );
});

// Yeni sürüm geldiğinde skipWaiting mesajını dinle
self.addEventListener("message", (event) => {
  if (event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
