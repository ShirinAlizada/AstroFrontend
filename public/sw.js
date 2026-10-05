// Web Push + minimal PWA service worker for Virgo Astrology.
// Registered unconditionally from src/routes/__root.tsx (installability —
// Chrome's "Add to Home Screen" requires an active service worker) and
// relied on for push by src/lib/push-client.ts. Handles incoming push
// messages and routes a notification click back into the app.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// No offline caching strategy (out of scope) — this passthrough fetch
// handler exists only because an active service worker needs one to count
// toward PWA installability. Everything still goes straight to the network.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Virgo Astrology", body: event.data.text() };
  }

  const title = payload.title || "Virgo Astrology";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { link: payload.link || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = (event.notification.data && event.notification.data.link) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(link);
      }
    }),
  );
});
