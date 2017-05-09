import {task} from 'functional/core/Task';
import {get} from 'functional/async/Fetch';
let request = task(data => Object.assign({uri: './products.json', headers: {'X-Local-Response': 'yes'}}, data))
    .through(get);

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
    .map(responseBody => new Response(JSON.stringify(responseBody), responseInit))



export {request, applyTemplate, task}



