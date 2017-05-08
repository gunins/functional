(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Task.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Task.js'], factory) :
	(factory((global['functional/async/Fetch'] = global['functional/async/Fetch'] || {}, global['functional/async/Fetch'].js = global['functional/async/Fetch'].js || {}),global.___core_Task_js));
}(this, (function (exports,___core_Task_js) { 'use strict';

let load = async (opt) => {
        let res = await fetch(opt.uri, Object.assign({
            headers: {
                'Accept':                      'application/json, text/plain, */*',
                'Content-Type':                'application/json'
            }
        }, opt));
        return res.json();
    };
let str = obj => Object.keys(obj)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
let fetchTask = ___core_Task_js.task(opt => load(opt));
let getBase = ___core_Task_js.task(opt => Object.assign(
        opt,
        {
            uri:  opt.uri + (opt.body ? '?' + str(opt.body) : ''),
            body: undefined
        }
    ));
let get = getBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'get'}
        ))
        .through(fetchTask);
let del = getBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'delete'}
        ))
        .through(fetchTask);
let postBase = ___core_Task_js.task(opt => Object.assign(
        {method: 'post'},
        opt,
        {body: JSON.stringify(opt.body || {})})
    );
let post = postBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'post'}
        ))
        .through(fetchTask);
let put = postBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'put'}
        ))
        .through(fetchTask);

exports.fetchTask = fetchTask;
exports.get = get;
exports.post = post;
exports.del = del;
exports.put = put;

Object.defineProperty(exports, '__esModule', { value: true });

})));
