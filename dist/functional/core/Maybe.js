(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global['functional/core/Maybe'] = global['functional/core/Maybe'] || {}, global['functional/core/Maybe'].js = {})));
}(this, (function (exports) { 'use strict';

const some = (value) => new Some(value);
const none = () => new None();

const _value = Symbol('_value');
class Some {
    constructor(value) {
        this[_value] = value;
    };

    isSome() {
        return ['[object Some]'].indexOf(this.toString()) !== -1
    };

    isOption() {
        return this.isMaybe();
    }
    isMaybe() {
        return ['[object Some]', '[object None]'].indexOf(this.toString()) !== -1;
    }

    get() {
        return this[_value];
    };

    map(fn) {
        return this.isSome() ? some(fn(this.get())) : none();
    };

    flatMap(fn) {
        const out = fn(this.get());
        if (out.isOption && out.isOption()) {
            return out;
        } else {
            throw new ReferenceError('Must return an Option');
        }

    }

    set(value) {
        return some(value);
    };

    isEmpty() {
        return this[_value] ? false : true;
    };

    getOrElse(defaultVal) {
        return this.isSome() ? this[_value] : defaultVal
    };

    getOrElseLazy(defaultVal = () => {
    }) {
        return this.isSome() ? this[_value] : defaultVal()
    };

    toString() {
        return '[object Some]';
    };
}

class None extends Some {
    constructor() {
        super();
    };

    isSome() {
        return false;
    };

    set(value) {
        return none();
    };

    toString() {
        return '[object None]';
    };

}

exports.Some = Some;
exports.some = some;
exports.None = None;
exports.none = none;

Object.defineProperty(exports, '__esModule', { value: true });

})));
