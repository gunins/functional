(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/List.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/List.js'], factory) :
	(factory((global['functional/utils/clone'] = global['functional/utils/clone'] || {}, global['functional/utils/clone'].js = {}),global.___core_List_js));
}(this, (function (exports,___core_List_js) { 'use strict';

let pair = (guard, action) => {
        return {guard, action}
    };
let objCopy = obj => {
        let copy = Object.assign({}, obj);
        return (fn) => {
            Object.keys(copy).forEach(attr => {
                copy[attr] = fn(copy[attr]);
            });
            return copy;
        }
    };
let isSimple = (obj) => typeof obj == 'boolean' || null == obj || 'object' != typeof obj;
let isDate = (obj) => Object.prototype.toString.call(obj) === '[object Date]';
let isArray = (obj) => Object.prototype.toString.call(obj) === '[object Array]';
let isObject = (obj) => (!!obj) && (obj.constructor === Object);
let isOther = (obj) => !isDate(obj) && !isArray(obj) && !isObject(obj);
let cloneSimple = (simple) => () => simple;
let cloneDate = (date) => () => {
        let copy = new Date();
        copy.setTime(date.getTime());
        return copy
    };
let cloneArray = (arr) => (fn) => arr.map(fn);
let cloneObj = (obj) => (fn) => objCopy(obj)(fn);
let arrayFunctor = pair(isArray, cloneArray);
let dateFunctor = pair(isDate, cloneDate);
let objectFunctor = pair(isObject, cloneObj);
let otherFunctor = pair(isOther, cloneSimple);
let functors = ___core_List_js.list(arrayFunctor, dateFunctor, objectFunctor, otherFunctor);
let getFunctor = (obj) => functors.find(fn => fn.guard(obj)).action(obj);
let clone = (obj) => getFunctor(obj)(children => clone(children));

exports.clone = clone;
exports.isSimple = isSimple;
exports.isDate = isDate;
exports.isArray = isArray;
exports.isObject = isObject;

Object.defineProperty(exports, '__esModule', { value: true });

})));
