(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['functional/core/Match'] = global['functional/core/Match'] || {}, global['functional/core/Match'].js = {})));
}(this, (function (exports) { 'use strict';

/**
 * Method pattern matching, applying functor if matc, else returning type with initial value.
 * @param type defining type which one to return
 * @params list of patterns takino @Object (case is function by taking initial value and return option,
 * "=>" is function to be applied for matching pattern and returning same @param type)
 * */
const match = (type) => (...args) => (resp) => {
    const {case: value, ['=>']: functor} = args.find(({case: _}) => _(resp).isOption() && _(resp).isSome()) || {};
    return functor ? functor(value(resp).get()) : type(resp);
};

exports.match = match;

Object.defineProperty(exports, '__esModule', { value: true });

})));
