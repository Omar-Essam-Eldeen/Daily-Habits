/* 21 Habits — service worker (v3.1.2).
   Strategy: stale-while-revalidate for same-origin GET requests so the
   app shell keeps working offline after the first visit.
   Push (v3): receives the nightly reminder from the server and opens the
   app when tapped. Reminder payloads are generic — they never contain
   habit data (habit data never leaves the device).
   Bump CACHE_NAME on release. */
const CACHE_NAME = 'habits-app-v312';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(['/','/index.html', '/manifest.webmanifest']))
      .then(() => self.skipWaiting())
      .catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never cache or intercept the push API — it must hit the network.
  if (url.pathname.startsWith('/api/')) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});

/* ---- v3 Web Push ---- */

self.addEventListener('push', (event) => {
  let payload = {
    title: '21 Habits',
    body: "Time to wrap up today — tick your habits and submit your day.",
    url: '/',
  };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    try {
      if (event.data) payload.body = event.data.text();
    } catch {
      /* keep the generic defaults — a reminder must never fail loudly */
    }
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'daily-reminder',
      dir: 'auto',
      data: { url: payload.url || '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ('focus' in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
        return undefined;
      })
      .catch(() => undefined),
  );
});
