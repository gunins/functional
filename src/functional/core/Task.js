import {List} from './List';
import {some, none} from './Option';
import {clone} from '../utils/clone';


const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
const toFunction = (job) => isFunction(job) ? job : () => job;
const emptyFn = _ => _;
const setPromise = (job) => (data, success) => new Promise((resolve, reject) => {
    const dataCopy = clone(data);
    const fn = job.getOrElse(emptyFn);
    if (success) {
        return (fn.length <= 1) ? resolve(fn(dataCopy)) : fn(dataCopy, resolve, reject);
    } else {
        return reject(dataCopy);
    }
});
/**
 * Task class is for asyns/sync jobs. You can provide 3 types on tasks
 *      @Task((resolve,reject)=>resolve()) // resolve reject params
 *      @Task(()=>3) synchronus function with returning value !important argumentList have to be empty
 *      @Task(3) // Static values
 * */
//Define Private methods;
const _parent = Symbol('_parent');
const _topRef = Symbol('_topRef');
const _topParent = Symbol('_topParent');
const _children = Symbol('_children');
const _resolvers = Symbol('_resolvers');
const _rejecters = Symbol('_rejecters');
const _resolve = Symbol('_resolve');
const _reject = Symbol('_reject');
const _bottomRef = Symbol('_bottomRef');
const _uuid = Symbol('_uuid');
const _create = Symbol('_create');
const _task = Symbol('_task');
const _setPromise = Symbol('_setPromise');
const _setParent = Symbol('_setParent');
const _addParent = Symbol('_addParent');
const _setChildren = Symbol('_setChildren');
const _resolveRun = Symbol('_resolveRun');
const _rejectRun = Symbol('_rejectRun');
const _triggerUp = Symbol('_triggerUp');
const _triggerDown = Symbol('_triggerDown');
const _run = Symbol('_run');
const _flatMap = Symbol('_flatMap');
const _copyJob = Symbol('_copyJob');
const _getTopRef = Symbol('_getTopRef');
const _getBottomRef = Symbol('_getBottomRef');
const _copy = Symbol('_copy');

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
        return setPromise(job);
    };

    [_setParent](parent) {
        if (parent && parent.isTask && parent.isTask()) {
            this[_parent] = some((..._) => parent[_triggerUp](..._));
            this[_topRef] = some((..._) => parent[_getTopRef](..._));
            this[_topParent] = some((..._) => parent[_addParent](..._));
        }
    };

    [_addParent](parent) {
        this[_topParent].getOrElse((parent) => {
            parent[_setChildren](this);
            this[_setParent](parent)
        })(parent);
        return this;
    };

    [_setChildren](children) {
        if (children && children.isTask && children.isTask()) {
            this[_children] = this[_children].insert((..._) => children[_run](..._));
            this[_bottomRef] = some((..._) => children[_getBottomRef](..._));
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

    [_run](data, success = true) {
        return this[_setPromise](this[_task])(data, success)
            .then((_) => this[_resolveRun](_))
            .catch((_) => this[_rejectRun](_));
    };

    [_flatMap](fn) {
        return this
            .map(fn)
            .map((responseTask) => {
                if (!(responseTask.isTask && responseTask.isTask())) {
                    return Promise.reject('flatMap has to return task');
                }
                return responseTask.unsafeRun();
            });
    };

    [_copyJob](parent) {
        const job = task(this[_task].get(), parent);
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
        const copyJob = goNext ? parent : this[_copyJob](parent);
        const next = goNext || this[_uuid] === uuid;
        return this[_bottomRef].getOrElse((uuid, job) => job)(uuid, copyJob, next);
    }

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };

    copy() {
        return this[_getTopRef](this[_uuid]);
    };


    map(fn) {
        const job = task(fn, this);
        this[_setChildren](job);
        return job;
    };

    flatMap(fn) {
        return this[_flatMap](fn)
    };

    through(joined) {
        return joined
            .copy()
            [_addParent](this);
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

    static all(tasks = [], context = {}) {
        return task()
            .flatMap(() => task(
                Promise.all(
                    tasks.map(_ => task(context)
                        .through(_)
                        .unsafeRun())
                )
            ));
    }
}

const task = (...tasks) => new Task(...tasks);

export {Task, task}
