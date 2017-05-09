import {task} from 'functional/core/Task';
import {get} from 'functional/async/Fetch';


/*define uri for rest request and return data also added shortcut for copy. Because this task required new every time initialised. */
let request = task(data=>Object.assign({uri: '/local/v1', headers:{'X-Local-Request':'yes'}}, data))
    .through(get);

/*create new task, with function to apply new Id on each item*/
export {request, task}