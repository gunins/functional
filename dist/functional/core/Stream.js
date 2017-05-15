(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js'), require('./Task.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js', './Task.js'], factory) :
	(factory((global['functional/core/Stream'] = global['functional/core/Stream'] || {}, global['functional/core/Stream'].js = global['functional/core/Stream'].js || {}),global.__Option_js,global.__Task_js));
}(this, (function (exports,__Option_js,__Task_js) { 'use strict';

/**
 * Stream is executing asynchronusly, Tasks, with Lazy evaluation.
 * */
let setTask = (fn) => fn && fn.isTask && fn.isTask() ? fn : __Task_js.task(fn);
class Stream {
    constructor(head, ...tail) {
        this._create(head, tail.length > 0 ? stream(...tail) : __Option_js.none());
    }

    //private function.
    _create(head, tail) {
        this.head = head !== undefined ? __Option_js.some(setTask(head)) : __Option_js.none();
        this.tail = tail && tail.isStream && tail.isStream() ? tail.copy() : __Option_js.none();
        return this;
    };

    //private method
    async _map(fn) {
        let {head, tail} = this;
        let empty = Stream.empty();
        if (head.isSome()) {
            let applyHead = await head.get().map(fn).unsafeRun();
            return empty._create(applyHead, tail.isSome && !tail.isSome() ? __Option_js.none() : tail._map(fn));
        } else {
            return empty;
        }
    };

    insert(head) {
        return Stream.empty()._create(setTask(head), this.head ? this : __Option_js.none());
    };

    _copy() {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty._create(head.get(), tail.isSome && !tail.isSome() ? __Option_js.none() : tail._copy()) : empty;

    };

    copy() {
        return this._copy();
    }

    /**
     * FROM stream(1,2,3) RETURNING stream(fn(1),fn(2),fn(3));
     * */
    map(fn) {
        return this._map(fn);
    };

    flatMap(fn) {

    };

    foldLeft() {
    };

    foldRight() {
    };

    reverse() {
    };

    concat() {
    };

    toArray() {
    };

    size() {

    };

    unsafeRun() {

    };

    isStream() {
        return this.toString() === '[object Stream]';
    };

    toString() {
        return '[object Stream]'
    };

    static empty() {
        return stream();
    };
}

let stream = (...tasks) => new Stream(...tasks);

exports.Stream = Stream;
exports.stream = stream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
