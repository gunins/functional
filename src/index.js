/**
 * Created by guntars on 25/04/2017.
 */
import {fetchTask} from './functional/async/Fetch';
import {task} from './functional/core/Task';
(async () => {
    let getData = await task({uri: './package.json'})
        .through(fetchTask)
        .unsafeRun();
    console.log(getData);
})()
