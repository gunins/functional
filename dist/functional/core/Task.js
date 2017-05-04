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
        this._topRef = __Option_js.none();
        this._children = __List_js.List.empty();
        this._resolvers = __List_js.List.empty();
        this._rejecters = __List_js.List.empty();
        this._resolve = __Option_js.none();
        this._reject = __Option_js.none();
        this._bottomRef = __Option_js.none();
        this._uuid = Symbol('uuid');
        this._create(job, parent);
    }

    //private function.
    _create(job, parent) {
        this._setParent(parent);
        this._task = job !== undefined ? __Option_js.some(toFunction(job)) : __Option_js.none();
        return this;
    };

    _setPromise(job) {
        return (data, res) => new Promise((resolve, reject) => {
            let out = ___utils_clone_js.clone(data),
                fn = job.getOrElse((resolve) => resolve(out));
            if (res) {
                return (fn.length === 0) ? resolve(fn(out)) : fn(resolve, reject, out);
            } else {
                return reject(out);
            }
        });
    };

    _setParent(parent) {
        if (parent && parent.isTask && parent.isTask()) {
            this._parent = __Option_js.some(parent._triggerUp.bind(parent));
            this._topRef = __Option_js.some(parent._getTopRef.bind(parent));
        }
    };

    _setChildren(children) {
        if (children && children.isTask && children.isTask()) {
            this._children = this._children.insert(children._run.bind(children));
            this._bottomRef = __Option_js.some(children._getBottomRef.bind(this));
        }

    };

    _resolveRun(data) {
        this._resolvers.forEach(fn => fn(data));
        this._resolve.getOrElse(emptyFn)(___utils_clone_js.clone(data));
        this._resolve = __Option_js.none();
        this._triggerDown(data, true);
        return ___utils_clone_js.clone(data);
    };

    _rejectRun(data) {
        this._rejecters.forEach(fn => fn(___utils_clone_js.clone(data)));
        this._reject.getOrElse(emptyFn)(___utils_clone_js.clone(data));
        this._reject = __Option_js.none();
        this._triggerDown(data, false);
        return ___utils_clone_js.clone(data);
    };

    _triggerUp() {
        return this._parent.getOrElse(() => this._run())();
    };


    _triggerDown(data, resolve) {
        this._children.map(child => child(data, resolve));
    };

    _run(resp, resolve = true) {
        return this._setPromise(this._task)(resp, resolve)
            .then(this._resolveRun.bind(this))
            .catch(this._rejectRun.bind(this));
    };

    _map(fn) {
        let job = task(fn, this);
        this._setChildren(job);
        return job;
    };

    _copyJob(parent) {
        let tasksRef = this._task.get();
        let job = task(tasksRef, parent);
        if (parent) {
            parent._setChildren(job);
        }
    };

    _getTopRef(uuid) {
        return this._topRef.getOrElse((uuid) => this._copy(uuid))(uuid);
    };

    _getBottomRef(uuid, parent) {
        return this._bottomRef.getOrElse((uuid, job) => job)(this._copyJob(uuid, parent));
    }

    _copy(uuid, parent) {
        return this._getBottomRef(parent);
    };

    copy() {
        return this._getTopRef(this._uuid);
    };

    _flatMap(fn) {
        return this.map(fn)
    }

    map(fn) {
        return this._map(fn);
    };


    flatMap(joined) {
        joined._setParent(this);
        this._setChildren(joined);
        return joined;
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
            this._resolve = __Option_js.some((data) => {
                resolve(data);
                res(data);
            });
            this._reject = __Option_js.some((data) => {
                reject(data);
                rej(data);
            });
            this._triggerUp();
        });
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
