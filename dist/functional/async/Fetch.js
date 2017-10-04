(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Task.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Task.js'], factory) :
	(factory((global['functional/async/Fetch'] = global['functional/async/Fetch'] || {}, global['functional/async/Fetch'].js = {}),global.___core_Task_js));
}(this, (function (exports,___core_Task_js) { 'use strict';

const load = async (opt) => {
    const res = await fetch(opt.uri, Object.assign({}, opt, {
        headers: Object.assign({
            'Accept':       'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }, opt && opt.headers ? opt.headers : {})
    }));
    return res.json();
};
const str = obj => Object.keys(obj)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');

const fetchTask = ___core_Task_js.task(opt => load(opt));

const getBase = ___core_Task_js.task(opt => {
    const {protocol, host, uri, body} = opt;
    return Object.assign(
        opt,
        {
            uri:  (host && protocol ? protocol.replace(':', '') + `://` + host + uri : uri) + (uri.indexOf('?') === -1 && body ? '?' + str(body) : ''),
            body: undefined
        }
    )
});
const get = getBase.copy()
    .map(opt => Object.assign(
        opt,
        {method: 'get'}
    ))
    .through(fetchTask);

const del = getBase.copy()
    .map(opt => Object.assign(
        opt,
        {method: 'delete'}
    ))
    .through(fetchTask);


const postBase = ___core_Task_js.task(opt => Object.assign(
    {method: 'post'},
    opt,
    {body: JSON.stringify(opt.body || {})})
);
const post = postBase.copy()
    .map(opt => Object.assign(
        opt,
        {method: 'post'}
    ))
    .through(fetchTask);
const put = postBase.copy()
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
