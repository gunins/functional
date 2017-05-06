import {task} from '../core/Task';
let load = (opt) => fetch(opt.uri, Object.assign({
    method:  'get',
    headers: {
        'Accept':       'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    }
}, opt))


let fetchTask = task(async opt => await load(opt))
    .map(response => response.json());

export {fetchTask}