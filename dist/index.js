(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('functional/async/Fetch')) :
	typeof define === 'function' && define.amd ? define(['functional/async/Fetch'], factory) :
	(factory(global.functional_async_Fetch));
}(this, (function (functional_async_Fetch) { 'use strict';

/**
 * Created by guntars on 25/04/2017.
 */
console.log(functional_async_Fetch.square(11)); // 121
console.log(functional_async_Fetch.diag(4, 3)); // 5

})));
