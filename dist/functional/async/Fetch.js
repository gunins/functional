(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['functional/async/Fetch'] = global['functional/async/Fetch'] || {}, global['functional/async/Fetch'].js = global['functional/async/Fetch'].js || {})));
}(this, (function (exports) { 'use strict';

const sqrt = Math.sqrt;
const square = (x) => x * x;
const diag = (x, y) => sqrt(square(x) + square(y));

exports.sqrt = sqrt;
exports.square = square;
exports.diag = diag;

Object.defineProperty(exports, '__esModule', { value: true });

})));
