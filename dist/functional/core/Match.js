(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['functional/core/Match'] = global['functional/core/Match'] || {}, global['functional/core/Match'].js = {})));
}(this, (function (exports) { 'use strict';

const match = (type) => (...args) => (resp) => {
    const {case: value, ['=>']: functor} = args.find(({case: _}) => _(resp).isOption() && _(resp).isSome()) || {};
    return functor ? functor(value(resp).get()) : type(resp);
};

exports.match = match;

Object.defineProperty(exports, '__esModule', { value: true });

})));
