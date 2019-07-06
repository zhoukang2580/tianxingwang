// self.addEventListener('install', function(e) {
// This event will be fired once when this version of the script is first registered for
// a given URL scope.
// It's an opportunity to initialize caches and prefetch data, if desired. This sort of
// work should be wrapped in a Promise, and e.waitUntil(promise) can be used to ensure that
// this installation does not complete until the Promise is settled.
// Also, be aware that there may already be an existing service worker controlling the page
// (either an earlier version of this script or a completely different script.)
//   console.log('Install event:', e);
// });

self.addEventListener("activate", function(e) {
  // This event will be fired once when this version of the script is first registered for
  // a given URL scope.
  // It's an opportunity to clean up any stale data that might be left behind in self.caches
  // by an older version of this script.
  // e.waitUntil(promise) is also available here to delay activation until work has been performed,
  // but note that waiting within the activate event will delay handling of any
  // fetch or message events that are fired in the interim. When possible, do work during the install phase.
  // It will NOT be fired each time the service worker is revived after being terminated.
  // To perform an action when the service worker is revived, include that logic in the
  // `onfetch` or `onmessage` event listeners.
  console.log("Activate event:", e);
});

self.addEventListener("install", function(event) {
  // only happens once for this version of the service worker
  // wait until the install event has resolved
  event.waitUntil(
    // then create our named cached
    caches
      .open("beeant-sw-cache")
      .then(function(cache) {
        // once created, lets add some local resouces
        console.log("service worker 已安装 ", cache);
        return cache.addAll([]);
      })
      .then(function() {
        console.log("Service worker is ready, and assets are cached");
      })
  );
});
self.addEventListener("fetch", function(event) {
  console.log("service worker fetch", event);
  // If the request in GET, let the network handle things,
  if (event.request.method !== "GET") {
    return;
  }
  // here we block the request and handle it our selves
  event.respondWith(
    // Returns a promise of the cache entry that matches the request
    caches.match(event.request).then(function(response) {
      // here we can hanlde the request how ever we want.
      // We can reutrn the cache right away if it exisit,
      // or go to network to fetch it.
      // There are more intricate examples below.
      // https://ponyfoo.com/articles/progressive-networking-serviceworker

      if (response) {
        // our responce is in the cache, let's return that instead
        return response;
      }
      // if the responce is not in the cache, let's fetch it
      return fetch(event.request)
        .then(function(response) {
          // we have a responce from the network
          console.log("caches", event);
          return response;
        })
        .catch(function(error) {
          // Something happened
          console.error("Fetching failed:", error);
          throw error;
        });
    })
  );
});
