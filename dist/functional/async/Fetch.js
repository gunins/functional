(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Task')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Task'], factory) :
	(factory((global['functional/async/Fetch'] = global['functional/async/Fetch'] || {}, global['functional/async/Fetch'].js = {}),global.Task));
}(this, (function (exports,Task) { 'use strict';

const {assign} = Object;

const load = async (opt) => {
    const res = await fetch(opt.uri, assign({}, opt, {
        headers: assign({
            'Accept':       'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }, opt && opt.headers ? opt.headers : {})
    }));
    return res.json();
};
const str = obj => Object.keys(obj)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');

const fetchTask = Task.task(opt => load(opt));

const uriPath = ({protocol, host, uri}) => (host && protocol ? protocol.replace(':', '') + `://` + host + uri : uri);

const getBase = Task.task(opt => {
    const {uri, body} = opt;
    return assign(
        {credentials: 'include'},
        opt,
        {
            uri:  uriPath(opt) + (uri.indexOf('?') === -1 && body ? '?' + str(body) : ''),
            body: undefined
        }
    )
});
const get = getBase.copy()
    .map(opt => assign(
        {method: 'get'},
        opt
    ))
    .through(fetchTask);

const del = getBase.copy()
    .map(opt => assign(
        {method: 'delete'},
        opt
    ))
    .through(fetchTask);


const postBase = Task.task(opt => assign(
    {
        method:      'post',
        credentials: 'include',
    },
    opt,
    {
        body: JSON.stringify(opt.body || {}),
        uri:  uriPath(opt)
    }));
const post = postBase.copy()
    .map(opt => assign(
        opt,
        {method: 'post'}
    ))
    .through(fetchTask);

const put = postBase.copy()
    .map(opt => assign(
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
