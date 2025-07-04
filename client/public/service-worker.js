const CACHE_NAME = "comic-tracker-v1";
const STATIC_CACHE_NAME = "comic-tracker-static-v1";
const DYNAMIC_CACHE_NAME = "comic-tracker-dynamic-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/assets/index-Ce-WZJsI.css",
  "/assets/index-DGYXzT3m.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith("comic-tracker-") &&
              name !== STATIC_CACHE_NAME &&
              name !== DYNAMIC_CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // For navigation requests, always try the network first
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/index.html")));
    return;
  }

  // For static assets, use cache-first strategy
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => response || fetch(request))
    );
    return;
  }

  // For API requests or other dynamic content, use network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clonedResponse = response.clone();
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(request, clonedResponse);
        });
        return response;
      })
      .catch(() => {
        return caches.match(request).then((response) => {
          if (response) {
            return response;
          }
          // If the request is for a page, return the offline page
          if (request.headers.get("Accept").includes("text/html")) {
            return caches.match("/index.html");
          }
        });
      })
  );
});

// Handle offline functionality
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
