const VERSION = '1.0.20';
const STATIC_CACHE_NAME = `carrot-jump-static-v${VERSION}`;
const DYNAMIC_CACHE_NAME = `carrot-jump-dynamic-v${VERSION}`;

// Check if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Assets that need to be available for offline use
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/sw.js',
    '/favicon.ico',
    '/icons/icon-16x16.png',
    '/icons/icon-32x32.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/src/index.ts',
    '/src/styles.css',
    '/src/game/constants.ts',
    '/src/game/GameStateManager.ts',
    '/src/game/Renderer.ts',
    '/src/game/version.ts'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting()) // Activate worker immediately
    );
});

// Activate event - clean up old caches and notify clients
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name.startsWith('carrot-jump-'))
                        .filter(name => name !== STATIC_CACHE_NAME && name !== DYNAMIC_CACHE_NAME)
                        .map(name => caches.delete(name))
                );
            }),
            // Notify all clients about the new version
            self.clients.matchAll().then(clients => {
                return Promise.all(
                    clients.map(client => {
                        return client.postMessage({
                            type: 'NEW_VERSION',
                            version: VERSION
                        });
                    })
                );
            })
        ])
    );
});

// Fetch event - use cache-first strategy for better offline support
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip source map requests
    if (event.request.url.endsWith('.map')) {
        return;
    }

    // Try to get from cache first
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // If we have a cached response, use it
                if (cachedResponse) {
                    // Try to update cache in the background
                    fetch(event.request)
                        .then(response => {
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return;
                            }
                            const responseToCache = response.clone();
                            caches.open(DYNAMIC_CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        })
                        .catch(() => {
                            // Ignore fetch errors - we're already using cached response
                        });

                    return cachedResponse;
                }

                // If no cache found, try network
                return fetch(event.request)
                    .then(response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();

                        // Add the response to dynamic cache
                        caches.open(DYNAMIC_CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If network fails and it's an HTML request, return index.html
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                        return new Response('Offline content not available');
                    });
            })
    );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
}); 