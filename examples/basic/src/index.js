import {task} from 'functional/core/Task';
import {get} from 'functional/async/Fetch';


/*Just simple tamplate for js arrays*/
let tempateInner = data => `<li>${data.id} <strong>Name:</strong> <span>${data.Name}</span> <strong>Price: </strong><span>${data.Price}</span></li>`;
let templateOuter = data => `<ul>${data}</ul>`;
/*Generate id on any new request*/
let addId = () => {
    let count = 0;
    return (data) => data.map(item => Object.assign(item, {id: count++}))
}
let newId = addId();

/*define uri for rest request and return data also added shortcut for copy. Because this task required new every time initialised. */
let basicGet = () => task({uri: './products.json'}).through(get).copy(),

    /*applyTemplate sequence*/
    /*First apply id on new request*/
    applyTemplate = task(newId)
    /*Apply inner template*/
        .map(data => data.map(item => tempateInner(item)))
        /*joining data and convert to string*/
        .map(data => data.join(''))
        /*apply outer template*/
        .map(data => templateOuter(data));


export {basicGet, applyTemplate}