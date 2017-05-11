import {task} from 'functional/core/Task';
import {get} from 'functional/async/Fetch';
let data = false;
let request = opt => data ? task(data) : task(opt => Object.assign({
    uri:     './products.json',
    headers: {'X-Local-Response': 'yes'}
}, opt))
    .through(get)
    .resolve(resp => data = resp);

let count = 0;
let addId = task((data) => data.map(item => Object.assign(item, {id: count++})));
/*Just simple template for js arrays*/
let templateInner = data => `<li>${data.id} <strong>Name:</strong> <span>${data.Name}</span> <strong>Price: </strong><span>${data.Price}</span></li>`;
let templateOuter = data => `<ul>${data}</ul>`;


let responseInit = {
    status:     200,
    statusText: 'OK',
    headers:    {
        'Content-Type':     'application/json',
        'X-Local-Response': 'yes'
    }
};

let applyTemplate = addId
/*Apply inner template*/
    .map(data => data.map(item => templateInner(item)))
    .map(data => data.join(''))
    .map(data => templateOuter(data))
    .map(responseBody => new Response(JSON.stringify(responseBody), responseInit));


let customResponse = task(event => new URL(event.request.url))
    .map(uri => uri.searchParams)
    .map(searchParams => searchParams.get('filter'))
    .flatMap(filter => request().copy().map(out => out[filter]))
    .through(applyTemplate);


let standardResponse = task(async event => {
    let response = await caches.match(event.request);
    return response || await fetch(event.request);
})

let response = event => task(event).flatMap(event => task(event).through(event.request.headers.has('X-Local-Request') ? customResponse : standardResponse));


export {response};



