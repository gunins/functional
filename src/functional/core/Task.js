import {List} from './List';
import {some, none} from './Option';
import {clone} from '../utils/clone';


let isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply),
    toFunction = (job) => isFunction(job) ? job : (resolve) => resolve(job),
    emptyFn = () => {
    };
/**
 * Task class is for asyns/sync jobs. You can provide 3 types on tasks
 *      @Task((resolve,reject)=>resolve()) // resolve reject params
 *      @Task(()=>3) synchronus function with returning value !important argumentList have to be empty
 *      @Task(3) // Static values
 * */
class Task {

    constructor(job, parent) {
        this._parent = none();
        this._topRef = none();
        this._children = List.empty();
        this._resolvers = List.empty();
        this._rejecters = List.empty();
        this._resolve = none();
        this._reject = none();
        this._bottomRef = none();
        this._uuid = Symbol('uuid');
        this._create(job, parent);
    }

    //private function.
    _create(job, parent) {
        this._setParent(parent);
        this._task = job !== undefined ? some(toFunction(job)) : none();
        return this;
    };

    _setPromise(job) {
        return (data, res) => new Promise((resolve, reject) => {
            let out = clone(data),
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
            this._parent = some(parent._triggerUp.bind(parent));
            this._topRef = some(parent._getTopRef.bind(parent));
        }
    };

    _setChildren(children) {
        if (children && children.isTask && children.isTask()) {
            this._children = this._children.insert(children._run.bind(children));
            this._bottomRef = some(children._getBottomRef.bind(this));
        }

    };

    _resolveRun(data) {
        this._resolvers.forEach(fn => fn(data));
        this._resolve.getOrElse(emptyFn)(clone(data));
        this._resolve = none();
        this._triggerDown(data, true);
        return clone(data);
    };

    _rejectRun(data) {
        this._rejecters.forEach(fn => fn(clone(data)));
        this._reject.getOrElse(emptyFn)(clone(data));
        this._reject = none();
        this._triggerDown(data, false);
        return clone(data);
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
        joined._setParent(this)
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
        this._resolvers = List.empty();
        this._rejecters = List.empty();
        return this;
    }

    /**
     * Method running executor and return Promise.
     * @param resolve executed when resolved
     * @param reject executed when rejected
     * */
    unsafeRun(resolve = emptyFn, reject = emptyFn) {
        return new Promise((res, rej) => {
            this._resolve = some((data) => {
                resolve(data);
                res(data);
            });
            this._reject = some((data) => {
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

export {Task, task}