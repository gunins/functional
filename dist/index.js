(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./functional/async/Fetch.js'), require('./functional/core/Task.js')) :
	typeof define === 'function' && define.amd ? define(['./functional/async/Fetch.js', './functional/core/Task.js'], factory) :
	(factory(global.__functional_async_Fetch_js,global.__functional_core_Task_js));
}(this, (function (__functional_async_Fetch_js,__functional_core_Task_js) { 'use strict';

/**
 * Created by guntars on 25/04/2017.
 */
(async () => {
    let getData = await __functional_core_Task_js.task({uri: './package.json'})
        .through(__functional_async_Fetch_js.fetchTask)
        .unsafeRun();
    console.log(getData);
})();

})));
