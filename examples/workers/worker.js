/**
 * Created by guntars on 09/05/2017.
 */
importScripts('../../node_modules/requirejs/require.js');
require.config({
    baseUrl: './dist'
});

let CACHE_VERSION = 1,
    CURRENT_CACHES = {
        prefetch: `window-cache-v ${CACHE_VERSION}`
    };
urlsToPrefetch = [
    '../../node_modules/requirejs/require.js',
    './dist/index.js',
    './products.json'
];

let fetchEvent = () => {
    },
    resolver = (resp) => {
        console.log('require initialised', resp);
        return fn => fn(resp)
    }

require(['./worker'], (resp) => fetchEvent = resolver(resp));

self.addEventListener('install', (event) => {
    console.log('Install event:', event);
    event.waitUntil(
        caches.open(CURRENT_CACHES.prefetch)
            .then(cache => cache.addAll(urlsToPrefetch)
                .then(() => self.skipWaiting()))
            .catch(error => console.error('Pre-fetching failed:', error)));
});

self.addEventListener('activate', (event) => {
    console.log('Activate event:', event);
    self.clients.claim();
    let expectedCacheNames = Object.keys(CURRENT_CACHES).map(key => CURRENT_CACHES[key]);
    event.waitUntil(
        caches.keys()
            .then(cacheNames => Promise.all(
                cacheNames.map(cacheName => {
                    if (expectedCacheNames.indexOf(cacheName) === -1) {
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            )));
});

self.addEventListener('fetch', event => fetchEvent(res => {
    let {response} = res;
    console.log('Handling fetch event for', event.request.url);
    event.respondWith(response(event).unsafeRun());
}))

