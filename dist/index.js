(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('./functional/async/Fetch.js')) :
	typeof define === 'function' && define.amd ? define(['./functional/async/Fetch.js'], factory) :
	(factory(global.__functional_async_Fetch_js));
}(this, (function (__functional_async_Fetch_js) { 'use strict';

/**
 * Created by guntars on 25/04/2017.
 */
console.log(__functional_async_Fetch_js.square(11)); // 121
console.log(__functional_async_Fetch_js.diag(4, 3)); // 5

})));
