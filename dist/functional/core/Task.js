(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js'], factory) :
	(factory((global['functional/core/Task'] = global['functional/core/Task'] || {}, global['functional/core/Task'].js = global['functional/core/Task'].js || {}),global.__Option_js));
}(this, (function (exports,__Option_js) { 'use strict';

let isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
let toFunction = (job) => isFunction(job) ? job : (resolve) => resolve(job);
let emptyFn = () => {
};
/**
 * Task class is for asyns/sync jobs. You can provide 3 types on tasks
 *      @Task((resolve,reject)=>resolve()) // resolve reject params
 *      @Task(()=>3) synchronus function with returning value !important argumentList have to be empty
 *      @Task(3) // Static values
 * */
class Task {

    constructor(job, parent) {
        this._parent = __Option_js.none();
        this._children = __Option_js.none();
        this._create(job, parent);
    }

    //private function.
    _create(job, parent) {
        this._setParent(parent);
        this._task = this._setPromise(job !== undefined ? __Option_js.some(toFunction(job)) : __Option_js.none(), parent);
        return this;
    };

    _setPromise(job, parent) {
        return (data) => new Promise((resolve, reject) => {
            let fn = job.getOrElse((_, reject) => reject('Task Empty'));
            return (fn.length === 0) ? resolve(fn(data)) : fn(resolve, reject, data);
        }).then(data => {
            return new Promise((resolve, reject) => resolve(data));
        });
    };

    _setParent(parent) {
        this._parent = parent && parent.isTask && parent.isTask() ? __Option_js.some(parent) : __Option_js.none();
    };

    _setChildren(children) {
        this._children = children && children.isTask && children.isTask() ? __Option_js.some(children) : __Option_js.none();
    };

    _triggerUp(resolve, reject) {
        return this._parent.getOrElse({_triggerUp: () => this._run(resolve, reject)})._triggerUp(resolve, reject);
    };


    _triggerDown(resolve, reject, data) {
        return this._children.getOrElse({
            _run: () => {
                resolve(data);
            }
        })._run(resolve, reject, data);

    };

    _run(resolve, reject, resp) {
        let job = this._task(resp);
        job.then((data) => {
            this._triggerDown(resolve, reject, data);
        }).catch(reject);
        return job;

    };

    _map(fn) {
        let job = task(fn, this);
        this._setChildren(job);
        return job;
    };

    map(fn) {
        return this._map(fn);
    };

    flatMap(fn) {
        // return fn();
    };

    isTask() {
        return this.toString() === '[object Task]';
    }

    toString() {
        return '[object Task]'
    };

    /**
     * Method running executor and return Promise.
     * @param resolve executed when resolved
     * @param reject executed when rejected
     * */
    unsafeRun(resolve = emptyFn, reject = emptyFn) {
        return this._triggerUp(resolve, reject);
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
