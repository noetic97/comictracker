const STATIC_CACHE_NAME = "comic-tracker-static-v2";
const RUNTIME_CACHE_NAME = "comic-tracker-runtime-v2";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith("comic-tracker-") &&
              name !== STATIC_CACHE_NAME &&
              name !== RUNTIME_CACHE_NAME
          )
          .map((name) => caches.delete(name))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Always try network first for navigation, fall back to cached shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Cache-first for JS/CSS and other static assets under /assets
  if (url.pathname.startsWith("/assets")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
          return response;
        });
      })
    );
    return;
  }

  // Network-first with runtime cache fallback for everything else (incl. API)
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE_NAME).then((cache) => {
          cache.put(request, copy);
        });
        return response;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || Promise.reject())
      )
  );
});

