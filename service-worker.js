{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 const CACHE_NAME = 'adhd-tracker-v1';\
const urlsToCache = [\
  '/',\
  '/index.html',\
  '/manifest.json',\
  '/icon-192.png',\
  '/icon-512.png'\
];\
\
// Install service worker and cache assets\
self.addEventListener('install', (event) => \{\
  event.waitUntil(\
    caches.open(CACHE_NAME)\
      .then((cache) => \{\
        console.log('Opened cache');\
        return cache.addAll(urlsToCache);\
      \})\
  );\
  self.skipWaiting();\
\});\
\
// Fetch assets from cache or network\
self.addEventListener('fetch', (event) => \{\
  event.respondWith(\
    caches.match(event.request)\
      .then((response) => \{\
        // Cache hit - return response\
        if (response) \{\
          return response;\
        \}\
        return fetch(event.request).then(\
          (response) => \{\
            // Check if valid response\
            if (!response || response.status !== 200 || response.type !== 'basic') \{\
              return response;\
            \}\
\
            // Clone the response\
            const responseToCache = response.clone();\
\
            caches.open(CACHE_NAME)\
              .then((cache) => \{\
                cache.put(event.request, responseToCache);\
              \});\
\
            return response;\
          \}\
        );\
      \})\
  );\
\});\
\
// Clean up old caches\
self.addEventListener('activate', (event) => \{\
  const cacheWhitelist = [CACHE_NAME];\
  event.waitUntil(\
    caches.keys().then((cacheNames) => \{\
      return Promise.all(\
        cacheNames.map((cacheName) => \{\
          if (cacheWhitelist.indexOf(cacheName) === -1) \{\
            return caches.delete(cacheName);\
          \}\
        \})\
      );\
    \})\
  );\
  self.clients.claim();\
\});\
\
// Handle push notifications\
self.addEventListener('push', (event) => \{\
  const data = event.data ? event.data.json() : \{\};\
  const title = data.title || 'ADHD Tracker Reminder';\
  const options = \{\
    body: data.body || 'Time for your check-in',\
    icon: '/icon-192.png',\
    badge: '/icon-192.png',\
    vibrate: [200, 100, 200],\
    data: \{\
      dateOfArrival: Date.now(),\
      primaryKey: 1\
    \},\
    actions: [\
      \{\
        action: 'open',\
        title: 'Open App'\
      \},\
      \{\
        action: 'close',\
        title: 'Dismiss'\
      \}\
    ]\
  \};\
\
  event.waitUntil(\
    self.registration.showNotification(title, options)\
  );\
\});\
\
// Handle notification clicks\
self.addEventListener('notificationclick', (event) => \{\
  event.notification.close();\
\
  if (event.action === 'open') \{\
    event.waitUntil(\
      clients.openWindow('/')\
    );\
  \}\
\});\
\
// Background sync for offline entries\
self.addEventListener('sync', (event) => \{\
  if (event.tag === 'sync-entries') \{\
    event.waitUntil(syncEntries());\
  \}\
\});\
\
async function syncEntries() \{\
  // This would sync any pending entries when connection is restored\
  console.log('Syncing entries...');\
  // Implementation would depend on your backend setup\
\}}