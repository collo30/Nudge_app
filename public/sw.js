// Pocket Budget Service Worker - Full Offline Support for Android
const CACHE_NAME = 'pocket-budget-v4';

// Core assets to pre-cache for offline functionality
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/favicon.png',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/icons/icon-72x72.png',
    '/icons/icon-96x96.png',
    '/icons/icon-128x128.png',
    '/icons/icon-144x144.png',
    '/icons/icon-152x152.png',
    '/icons/icon-192x192.png',
    '/icons/icon-384x384.png',
    '/icons/icon-512x512.png'
];

// Install event - cache everything we can
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker v4 - Full Offline Support');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Pre-caching app shell and assets');
            // Cache core assets, but don't fail if some are missing
            return Promise.allSettled(
                PRECACHE_ASSETS.map(url =>
                    cache.add(url).catch(err => {
                        console.log('[SW] Failed to cache:', url, err);
                    })
                )
            );
        })
    );
    // Activate immediately - don't wait
    self.skipWaiting();
});

// Activate event - clean up old caches and take control
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    // Take control of all pages immediately
    self.clients.claim();
});

// Fetch event - CACHE FIRST for everything (true offline support)
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip chrome-extension, capacitor, and other non-http requests
    if (!url.protocol.startsWith('http')) return;

    // Skip requests to external APIs
    if (url.hostname.includes('googleapis.com') ||
        url.hostname.includes('google.com') ||
        url.hostname.includes('gstatic.com')) {
        return;
    }

    // For Google Fonts, use network first with cache fallback
    if (url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // For same-origin requests: CACHE FIRST (always work offline)
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached version if available
            if (cachedResponse) {
                // Update cache in background for next time (stale-while-revalidate)
                fetch(event.request).then((response) => {
                    if (response && response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, response);
                        });
                    }
                }).catch(() => { /* Ignore network errors during background update */ });

                return cachedResponse;
            }

            // Not in cache - fetch from network and cache it
            return fetch(event.request).then((response) => {
                // Don't cache bad responses
                if (!response || response.status !== 200) {
                    return response;
                }

                // Clone and cache the response
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            }).catch(() => {
                // Network failed and not in cache
                // For navigation requests, return cached index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }

                // For images, return nothing (let browser show broken image)
                if (event.request.destination === 'image') {
                    return new Response('', { status: 404 });
                }

                // For other requests, return a basic offline response
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Offline',
                    headers: { 'Content-Type': 'text/plain' }
                });
            });
        })
    );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Background sync for offline data (future enhancement)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
});

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');
});
