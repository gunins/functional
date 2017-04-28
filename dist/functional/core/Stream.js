(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js'), require('./Task.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js', './Task.js'], factory) :
	(factory((global['functional/core/Stream'] = global['functional/core/Stream'] || {}, global['functional/core/Stream'].js = global['functional/core/Stream'].js || {}),global.__Option_js,global.__Task_js));
}(this, (function (exports,__Option_js,__Task_js) { 'use strict';

class Stream {
    constructor(head, ...tail) {
        this._create(head, tail.length > 0 ? stream(...tail) : __Option_js.none());
    }

    //private function.
    _create(head, tail) {
        this.head = head !== undefined ? __Option_js.some(head) : __Option_js.none();
        this.tail = tail && tail.isStream && tail.isStream() ? this._setTail(tail) : __Option_js.none();
        return this;
    };

    _setTail(tail) {
        return new Promise(resolve=>{

        })
    }

    //private method
    _map(fn, i = 0) {
        let {head, tail} = this;
        let empty = List.empty();
        return head.isSome() ? empty._create(fn(head.get(), i), tail.isSome && !tail.isSome() ? __Option_js.none() : tail._map(fn, i + 1)) : empty;
    };

    copy() {
        return this.map(a => a);
    };

    map(fn) {
        return this._map(fn);
    };

    toString() {
        return '[object Stream]'
    };

    isStream() {
        return this.toString() === '[object Stream]';
    };
}

let stream = (...tasks) => new Stream(...tasks);

exports.Stream = Stream;
exports.stream = stream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
