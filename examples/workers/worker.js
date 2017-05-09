/**
 * Created by guntars on 09/05/2017.
 */
importScripts('../../node_modules/requirejs/require.js');
require.config({
    baseUrl: './dist'
});

self.addEventListener('install', (e) => {
    console.log('Install event:', e);
});

self.addEventListener('activate', (e) => {
    console.log('Activate event:', e);
    self.clients.claim();

});

var request = {}, applyTemplate = {};

require(['./worker'], (resp) => {
    request = resp.request;
    applyTemplate = resp.applyTemplate
});

self.addEventListener('fetch', (event) => {
    console.log('Handling fetch event for', event.request.url);
    if (event.request.headers.has('X-Local-Request')) {
        let {searchParams} = new URL(event.request.url);
        let filter = searchParams.get('filter');

        event.respondWith(request.copy()
            .map(data => data[filter])
            .through(applyTemplate)
            .unsafeRun()
        );
    }
})


