const CACHE_NAME = "mtal-cache-v11"; // Her değişiklikte artır
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./data.json",
  "./87348b3b-97a8-4fe6-a8e9-cca8434bad69.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("Eski cache siliniyor:", key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first stratejisi (HTML dosyaları için)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // HTML dosyaları için her zaman güncel veriyi al
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // JSON dosyaları için her zaman güncel veriyi al (yemek.json, data.json)
  if (event.request.url.includes('.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Diğer dosyalar için cache-first (resimler, CSS, JS)
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
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});