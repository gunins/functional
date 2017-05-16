(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js'), require('./Task.js'), require('./List.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js', './Task.js', './List.js'], factory) :
	(factory((global['functional/core/Stream'] = global['functional/core/Stream'] || {}, global['functional/core/Stream'].js = global['functional/core/Stream'].js || {}),global.__Option_js,global.__Task_js,global.__List_js));
}(this, (function (exports,__Option_js,__Task_js,__List_js) { 'use strict';

/**
 * Stream is executing asynchronusly, Tasks, with Lazy evaluation.
 * */
let setTask = (fn) => fn && fn.isTask && fn.isTask() ? fn : __Task_js.task(fn);
class Stream {
    constructor(head, ...tail) {
        this._resolve = __Option_js.none();
        this._reject = __Option_js.none();

        this._create(head, tail.length > 0 ? stream(...tail) : __Option_js.none());
    }

    //private function.
    _create(head, tail) {
        this.head = head !== undefined ? __Option_js.some(setTask(head)) : __Option_js.none();
        this.tail = tail && tail.isStream && tail.isStream() ? tail.copy() : __Option_js.none();
        return this;
    };

    //Private Method
    _reverse(stream) {
        let {head, tail} = this;
        if (head.isSome()) {
            let insert = stream.insert(head.get());
            if (tail.isSome && !tail.isSome()) {
                return insert;
            } else {
                return tail._reverse(insert);
            }
        } else {
            return stream;
        }
    };

    //private method
    _map(fn) {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty._create(head.get().map(fn), tail.isSome && !tail.isSome() ? __Option_js.none() : tail._map(fn)) : empty;

    };

    _forEach(fn) {
        let {head, tail} = this;
        if (head.isSome()) {
            fn(head.get().copy());
        }

        if (tail && tail.isStream && tail.isStream()) {
            tail._forEach(fn);
        }
    }

    insert(head) {
        return Stream.empty()._create(setTask(head), this.head ? this : __Option_js.none());
    };

    _copy() {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty._create(head.get().copy(), tail.isSome && !tail.isSome() ? __Option_js.none() : tail._copy()) : empty;

    };

    copy() {
        return this._copy();
    };

    async _run() {
        let {head, tail} = this;
        let empty = __List_js.List.empty();

        if (head.isSome()) {
            let awaitHEad = await head.get().unsafeRun();
            empty = empty.insert(awaitHEad);
        }

        if (tail.isStream && tail.isStream()) {
            let awaitTail = await tail._run();
            empty = empty.concat(awaitTail);
        }

        return empty;

    };

    /**
     * FROM stream(1,2,3) RETURNING stream(task(1),task(2),task(3));
     * */
    map(fn) {
        return this._map(fn);
    };


    async foldLeft(initial, fn) {
        let list = await this.toList();
        return list.foldLeft(initial, fn);
    };

    async foldRight(initial, fn) {
        let list = await this.toList();
        return list.foldRight(initial, fn);
    };

    reverse() {
        let {head} = this,
            empty = Stream.empty();
        if (!head.isSome()) {
            return empty;
        } else {
            return this._reverse(empty);
        }
    };

    concat(...streams) {
        let empty = Stream.empty();
        [this].concat(streams).forEach(stream => {
            stream._forEach(record => {
                empty = empty.insert(record);
            });
        });
        return empty.reverse();
    };

    size() {
        let count = 0;
        this._forEach(() => count++);
        return count;
    };

    isStream() {
        return this.toString() === '[object Stream]';
    };

    async toArray() {
        let streamList = await this.toList();
        return streamList.toArray();
    };

    async toList() {
        return await this._run();
    }

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
