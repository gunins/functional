(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['functional/core/Option'] = global['functional/core/Option'] || {}, global['functional/core/Option'].js = global['functional/core/Option'].js || {})));
}(this, (function (exports) { 'use strict';

let some = (value) => new Some(value);
let none = () => new None();

class Some {
    constructor(value) {
        this.value = value;
    }

    isSome() {
        return true
    }

    get() {
        return this.value;
    }

    set(value) {
        return some(value);
    }

    isEmpty() {
        return this.value ? false : true;
    }

    getOrElse(defaultVal) {
        return this.isSome() ? this.value : defaultVal
    }

    toString() {
        return '[object Some]';
    }
}

class None extends Some {
    constructor() {
        super();
    }

    isSome() {
        return false;
    }

    set(value) {
        return none();
    }

    toString() {
        return '[object None]';
    }

}

exports.Some = Some;
exports.some = some;
exports.None = None;
exports.none = none;

Object.defineProperty(exports, '__esModule', { value: true });

})));
