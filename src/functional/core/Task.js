import {List} from './List';
import {some, none} from './Option';
import {clone} from '../utils/clone';


let isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply),
    toFunction = (job) => isFunction(job) ? job : (_, resolve) => resolve(job),
    emptyFn = () => {
    };
/**
 * Task class is for asyns/sync jobs. You can provide 3 types on tasks
 *      @Task((resolve,reject)=>resolve()) // resolve reject params
 *      @Task(()=>3) synchronus function with returning value !important argumentList have to be empty
 *      @Task(3) // Static values
 * */
//Define Private methods;
const _parent = Symbol('_parent'),
    _topRef = Symbol('_topRef'),
    _topParent = Symbol('_topParent'),
    _children = Symbol('_children'),
    _resolvers = Symbol('_resolvers'),
    _rejecters = Symbol('_rejecters'),
    _resolve = Symbol('_resolve'),
    _reject = Symbol('_reject'),
    _bottomRef = Symbol('_bottomRef'),
    _uuid = Symbol('_uuid'),

    _create = Symbol('_create'),
    _task = Symbol('_task'),
    _setPromise = Symbol('_setPromise'),
    _setParent = Symbol('_setParent'),
    _addParent = Symbol('_addParent'),
    _setChildren = Symbol('_setChildren'),
    _resolveRun = Symbol('_resolveRun'),
    _rejectRun = Symbol('_rejectRun'),
    _triggerUp = Symbol('_triggerUp'),
    _triggerDown = Symbol('_triggerDown'),
    _run = Symbol('_run'),
    _map = Symbol('_map'),
    _flatMap = Symbol('_flatMap'),
    _copyJob = Symbol('_copyJob'),
    _getTopRef = Symbol('_getTopRef'),
    _getBottomRef = Symbol('_getBottomRef'),
    _copy = Symbol('_copy');

class Task {

    constructor(job, parent) {
        this[_parent] = none();
        this[_topRef] = none();
        this[_topParent] = none();
        this[_children] = List.empty();
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();
        this[_resolve] = none();
        this[_reject] = none();
        this[_bottomRef] = none();
        this[_uuid] = Symbol('uuid');
        this[_create](job, parent);
    }

    //private function.
    [_create](job, parent) {
        this[_setParent](parent);
        this[_task] = job !== undefined ? some(toFunction(job)) : none();
        return this;
    };

    [_setPromise](job) {
        return (data, res) => new Promise((resolve, reject) => {
            let out = clone(data),
                fn = job.getOrElse((_, resolve) => resolve(out));
            if (res) {
                return (fn.length <= 1) ? resolve(fn(out)) : fn(out, resolve, reject);
            } else {
                return reject(out);
            }
        });
    };

    [_setParent](parent) {
        if (parent && parent.isTask && parent.isTask()) {
            this[_parent] = some(parent[_triggerUp].bind(parent));
            this[_topRef] = some(parent[_getTopRef].bind(parent));
            this[_topParent] = some(parent[_addParent].bind(parent));
        }
    };

    [_addParent](parent) {
        this[_topParent].getOrElse((parent) => {
            parent[_setChildren](this);
            this[_setParent](parent)
        })(parent)
    };

    [_setChildren](children) {
        if (children && children.isTask && children.isTask()) {
            this[_children] = this[_children].insert(children[_run].bind(children));
            this[_bottomRef] = some(children[_getBottomRef].bind(children));
        }

    };

    [_resolveRun](data) {
        this[_resolvers].forEach(fn => fn(data));
        this[_resolve].getOrElse(emptyFn)(clone(data));
        this[_resolve] = none();
        this[_triggerDown](data, true);
        return clone(data);
    };

    [_rejectRun](data) {
        this[_rejecters].forEach(fn => fn(clone(data)));
        this[_reject].getOrElse(emptyFn)(clone(data));
        this[_reject] = none();
        this[_triggerDown](data, false);
        return clone(data);
    };

    [_triggerUp]() {
        return this[_parent].getOrElse(() => this[_run]())();
    };


    [_triggerDown](data, resolve) {
        this[_children].map(child => child(data, resolve));
    };

    [_run](resp, resolve = true) {
        return this[_setPromise](this[_task])(resp, resolve)
            .then(this[_resolveRun].bind(this))
            .catch(this[_rejectRun].bind(this));
    };

    [_map](fn) {
        let job = task(fn, this);
        this[_setChildren](job);
        return job;
    };

    [_flatMap](fn) {
        return this[_map](fn)
            .map((responseTask, res, rej) => {
                if (!(responseTask.isTask && responseTask.isTask())) {
                    rej('flatMap has to return task');
                }
                responseTask.unsafeRun().then(res).catch(rej);
            });
    };

    [_copyJob](parent) {
        let job = task(this[_task].get(), parent);
        job[_resolvers] = this[_resolvers];
        job[_rejecters] = this[_rejecters];


        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_getTopRef](uuid, parent) {
        return this[_topRef].getOrElse((uuid, parent) => this[_copy](uuid, parent))(uuid, parent);
    };

    [_getBottomRef](uuid, parent, goNext = false) {
        let copyJob = goNext ? parent : this[_copyJob](parent);
        let next = goNext || this[_uuid] === uuid ? true : false;
        return this[_bottomRef].getOrElse((uuid, job) => job)(uuid, copyJob, next);
    }

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };

    copy() {
        return this[_getTopRef](this[_uuid]);
    };


    map(fn) {
        return this[_map](fn);
    };

    flatMap(fn) {
        return this[_flatMap](fn)
    };

    through(joined) {
        let clone = joined.copy();
        clone[_addParent](this);
        return clone;
    };

    forEach(fn) {
        return this.map((d, res) => {
            fn(d);
            res(d);
        });
    };

    resolve(fn) {
        this[_resolvers] = this[_resolvers].insert(fn);
        return this;
    };

    reject(fn) {
        this[_rejecters] = this[_rejecters].insert(fn);
        return this;
    }

    isTask() {
        return this.toString() === '[object Task]';
    }

    toString() {
        return '[object Task]'
    };

    clear() {
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();
        return this;
    }

    /**
     * Method running executor and return Promise.
     * @param resolve executed when resolved
     * @param reject executed when rejected
     * */
    unsafeRun(resolve = emptyFn, reject = emptyFn) {
        return new Promise((res, rej) => {
            this[_resolve] = some((data) => {
                resolve(data);
                res(data);
            });
            this[_reject] = some((data) => {
                reject(data);
                rej(data);
            });
            this[_triggerUp]();
        });
    };


    static empty() {
        return task();
    };
}

let task = (...tasks) => new Task(...tasks);

export {Task, task}