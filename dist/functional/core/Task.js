(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./List.js'), require('./Option.js'), require('../utils/clone.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './List.js', './Option.js', '../utils/clone.js'], factory) :
	(factory((global['functional/core/Task'] = global['functional/core/Task'] || {}, global['functional/core/Task'].js = global['functional/core/Task'].js || {}),global.__List_js,global.__Option_js,global.___utils_clone_js));
}(this, (function (exports,__List_js,__Option_js,___utils_clone_js) { 'use strict';

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
        this._children = __List_js.List.empty();
        this._resolvers = __List_js.List.empty();
        this._rejecters = __List_js.List.empty();
        this._uuid = Symbol('uuid');
        this._create(job, parent);
    }

    //private function.
    _create(job, parent) {
        this._setParent(parent);
        this._task = this._setPromise(job !== undefined ? __Option_js.some(toFunction(job)) : __Option_js.none(), parent);
        return this;
    };

    _setPromise(job) {
        return (data) => new Promise((resolve, reject) => {
            let fn = job.getOrElse((_, reject) => reject('Task Empty'));
            return (fn.length === 0) ? resolve(fn(___utils_clone_js.clone(data))) : fn(resolve, reject, ___utils_clone_js.clone(data));
        }).then(data => {
            return new Promise((resolve) => {
                this._resolvers.forEach(fn => fn(data));
                resolve(___utils_clone_js.clone(data));
            });
        }).catch(data => new Promise((resolve, reject) => {
            this._rejecters.forEach(fn => fn(___utils_clone_js.clone(data)));
            reject(___utils_clone_js.clone(data));
        }));
    };

    _setParent(parent) {
        this._parent = parent && parent.isTask && parent.isTask() ? __Option_js.some(parent._triggerUp.bind(parent)) : __Option_js.none();
    };

    _setChildren(children) {
        this._children = children && children.isTask && children.isTask() ? this._children.insert(children._run.bind(children)) : this._children;
    };

    _triggerUp(resolve, reject, uuids = []) {
        let allIds = ___utils_clone_js.clone(uuids);
        allIds.push(this._uuid);
        return this._parent.getOrElse(() => this._run(resolve, reject, allIds))(resolve, reject, allIds);
    };


    _triggerDown(resolve, reject, uuids, data, final) {
        let finalData = uuids.indexOf(this._uuid) === 0 ? data : final;
        this._children.map(child => child(resolve, reject, uuids, data, finalData)).getOrElse(() => {
            resolve(___utils_clone_js.clone(finalData));
        });
    };

    _run(resolve, reject, uuids, resp, final) {
        let job = this._task(resp);
        job.then((data) => {
            this._triggerDown(resolve, reject, uuids, data, final);
        }).catch(data => reject(___utils_clone_js.clone(data)));

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

    forEach(fn) {
        return this.map((res, rej, d) => {
            fn(d);
            res(d);
        });
    };

    resolve(fn) {
        this._resolvers = this._resolvers.insert(fn);
        return this;
    };

    reject(fn) {
        this._rejecters = this._rejecters.insert(fn);
        return this;
    }

    isTask() {
        return this.toString() === '[object Task]';
    }

    toString() {
        return '[object Task]'
    };

    clear() {
        this._resolvers = __List_js.List.empty();
        this._rejecters = __List_js.List.empty();
        return this;
    }

    /**
     * Method running executor and return Promise.
     * @param resolve executed when resolved
     * @param reject executed when rejected
     * */
    unsafeRun(resolve = emptyFn, reject = emptyFn) {
        return new Promise((res, rej) => {
            this._triggerUp(res, rej);
        }).then(data => {
            resolve(data);
            return data;
        }).catch(data => {
            console.log(data, 'reject');
            reject(data);
            return data;
        })
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
