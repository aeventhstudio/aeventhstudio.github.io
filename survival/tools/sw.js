/* Æventh Survival Tools – Service Worker. VERSION bei jedem Release erhöhen. */
var VERSION = "0.1.0";
var CACHE = "aeventh-planer-" + VERSION;
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (f) { return new Request(f, { cache: "reload" }); })); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf("aeventh-planer-") === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("message", function (e) { if (e.data === "skipWaiting") self.skipWaiting(); });
self.addEventListener("fetch", function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  if (url.pathname.endsWith("version.json")) { e.respondWith(fetch(e.request, { cache: "no-store" })); return; }
  if (url.pathname.endsWith("audio/index.json")) { e.respondWith(fetch(e.request, { cache: "no-store" }).then(function (res) { if (res && res.ok) { var c2 = res.clone(); caches.open(CACHE).then(function (c) { c.put(url.pathname, c2); }); } return res; })
    .catch(function () { return caches.match(url.pathname); })); return; }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    return hit || fetch(e.request).then(function (res) {
      if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    }).catch(function () { return caches.match("index.html"); });
  }));
});
