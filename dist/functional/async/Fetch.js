(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Task.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Task.js'], factory) :
	(factory((global['functional/async/Fetch'] = global['functional/async/Fetch'] || {}, global['functional/async/Fetch'].js = global['functional/async/Fetch'].js || {}),global.___core_Task_js));
}(this, (function (exports,___core_Task_js) { 'use strict';

let load = (opt) => fetch(opt.uri, Object.assign({
    method:  'get',
    headers: {
        'Accept':       'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    }
}, opt));


let fetchTask = ___core_Task_js.task(async opt => await load(opt))
    .map(response => response.json());

exports.fetchTask = fetchTask;

Object.defineProperty(exports, '__esModule', { value: true });

})));
