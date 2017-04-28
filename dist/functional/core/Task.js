(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js'], factory) :
	(factory((global['functional/core/Task'] = global['functional/core/Task'] || {}, global['functional/core/Task'].js = global['functional/core/Task'].js || {}),global.__Option_js));
}(this, (function (exports,__Option_js) { 'use strict';

let isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
let toFunction = (job) => isFunction(job) ? job : (resolve) => resolve(job);
let emptyFn = () => {
};
class Task {

    constructor(job) {
        this._create(job);
    }

    //private function.
    _create(job) {
        this._task = this._setPromise(job !== undefined ? __Option_js.some(toFunction(job)) : __Option_js.none());
        return this;
    };

    _setPromise(job) {
        return () => new Promise((resolve, reject) => {
            let fn = job.getOrElse((_, reject) => reject('Task Empty'));
            return (fn.length === 0) ? resolve(fn()) : fn(resolve, reject);
        });
    };

    unsafeRun(success = emptyFn, error = emptyFn) {
        let task = this._task();
        task.then(success).catch(error);
        return task;
    };

    static empty() {
        return task();
    };
}

let task = (...tasks) => new Task(...tasks);

exports.Task = Task;
exports.task = task;

Object.defineProperty(exports, '__esModule', { value: true });

})));
