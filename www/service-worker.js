/**
 * Wallet Watcher Pro - Service Worker
 * Native Cache API based offline caching for PWA (no build step required)
 */

const CACHE_NAME = 'wallet-watcher-pro-v1';
const STATIC_CACHE = 'wwp-static-v1';
const API_CACHE = 'wwp-api-v1';
const FONT_CACHE = 'wwp-font-v1';
const IMAGE_CACHE = 'wwp-image-v1';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Orbitron:wght@400;700;900&display=swap',
];

// API origins to cache with Network First
const API_ORIGINS = [
  'https://api.coingecko.com',
  'https://api.mainnet-beta.solana.com',
  'https://ethereum.publicnode.com',
  'https://bsc-dataseed.binance.org',
  'https://mainnet.base.org',
  'https://toncenter.com',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some static assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE && name !== FONT_CACHE && name !== IMAGE_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => clients.claim())
  );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension, data:, blob: URLs
  if (!url.protocol.startsWith('http')) return;

  // API calls - Network First with short cache
  if (API_ORIGINS.some((origin) => url.origin === origin)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE, 5 * 60)); // 5 min
    return;
  }

  // Google Fonts - Cache First, long expiration
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirstStrategy(request, FONT_CACHE, 365 * 24 * 60 * 60)); // 1 year
    return;
  }

  // Chart.js CDN - Cache First
  if (url.origin === 'https://cdn.jsdelivr.net') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE, 30 * 24 * 60 * 60)); // 30 days
    return;
  }

  // Static assets (CSS, JS, images) - Cache First
  if (request.destination === 'style' || request.destination === 'script' || request.destination === 'image' || request.destination === 'font') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE, 30 * 24 * 60 * 60));
    return;
  }

  // Navigation (HTML) - Network First
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, STATIC_CACHE, 24 * 60 * 60)); // 24 hours
    return;
  }

  // Default - Network First
  event.respondWith(networkFirstStrategy(request, STATIC_CACHE, 24 * 60 * 60));
});

// Network First Strategy
async function networkFirstStrategy(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      // Clone before caching
      const responseToCache = response.clone();
      // Check age and cache
      const cachedResponse = await cache.match(request);
      if (!cachedResponse || isExpired(cachedResponse, maxAgeSeconds)) {
        await cache.put(request, responseToCache);
      }
    }
    return response;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      if (!isExpired(cachedResponse, maxAgeSeconds)) {
        return cachedResponse;
      }
      // Expired but we have it - return stale while revalidating in background
      fetch(request).then((freshResponse) => {
        if (freshResponse.ok) cache.put(request, freshResponse.clone());
      }).catch(() => {});
      return cachedResponse;
    }
    // No cache, return offline page or error
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse && !isExpired(cachedResponse, maxAgeSeconds)) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse; // Return stale
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Check if cached response is expired
function isExpired(response, maxAgeSeconds) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  const cacheTime = new Date(dateHeader).getTime();
  const now = Date.now();
  return (now - cacheTime) > maxAgeSeconds * 1000;
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-wallets') {
    event.waitUntil(syncWallets());
  }
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncWallets() {
  console.log('[SW] Syncing wallets...');
  // Implementation for syncing wallet data when online
}

async function syncNotifications() {
  console.log('[SW] Syncing notifications...');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Новое уведомление',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data || {},
      actions: [
        { action: 'open', title: 'Открыть' },
        { action: 'dismiss', title: 'Закрыть' },
      ],
      requireInteraction: data.priority === 'high',
      tag: data.tag || 'wallet-watcher-notification',
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Wallet Watcher Pro', options)
    );
  } catch (e) {
    console.error('[SW] Push error:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow('/index.html'));
  }
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'getCacheStats') {
    event.waitUntil(getCacheStats().then((stats) => {
      event.ports[0].postMessage(stats);
    }));
  }
  if (event.data === 'clearCache') {
    event.waitUntil(clearAllCaches());
  }
});

async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    stats[name] = keys.length;
  }
  return stats;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}

console.log('[SW] Wallet Watcher Pro Service Worker loaded');
