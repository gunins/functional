import {task} from 'functional/core/Task';
import {get} from 'functional/async/Fetch';


/*define uri for rest request and return data also added shortcut for copy. Because this task required new every time initialised. */
let count = 0;
let response = () => task({uri: './products.json'}).through(get).copy();

/*create new task, with function to apply new Id on each item*/
let resolveData = task((data) => data.map(item => Object.assign(item, {id: count++})))

export {response, resolveData}