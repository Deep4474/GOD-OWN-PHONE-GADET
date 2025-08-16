const CACHE_NAME = 'gopg-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/favicon.ico',
    '/apple-touch-icon.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/site.webmanifest',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/dist/umd/supabase.min.js'
];

// Install service worker and cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
    // Handle API requests differently
    if (event.request.url.includes('phone-2cv4.onrender.com') ||
        event.request.url.includes('jlwxkykznyjmstpjcgks.supabase.co')) {
        event.respondWith(
            fetch(event.request)
                .catch(error => {
                    console.error('Fetch error:', error);
                    return new Response(
                        JSON.stringify({ error: 'Network error. Please check your connection.' }),
                        {
                            status: 503,
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })
        );
        return;
    }

    // For static assets, try cache first then network
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request)
                    .then(response => {
                        // Cache new resources
                        if (response.ok && !event.request.url.includes('chrome-extension://')) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseToCache));
                        }
                        return response;
                    })
                    .catch(error => {
                        console.error('Fetch error:', error);
                        // For HTML requests, return the offline page
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                        throw error;
                    });
            })
    );
});
