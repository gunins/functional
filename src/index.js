/**
 * Created by guntars on 25/04/2017.
 */
import {get} from './functional/async/Fetch';
import {task} from './functional/core/Task';
(async () => {
    let getData = await task({uri: './package.json'})
        .through(get)
        .unsafeRun();
    console.log(getData);
})()
