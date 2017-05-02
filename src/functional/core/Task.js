import {some, none} from './Option';
import {clone} from '../utils/clone';

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
        this._parent = none();
        this._children = none();
        this._create(job, parent);
    }

    //private function.
    _create(job, parent) {
        this._setParent(parent);
        this._task = this._setPromise(job !== undefined ? some(toFunction(job)) : none(), parent);
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
        this._parent = parent && parent.isTask && parent.isTask() ? some(parent._triggerUp.bind(parent)) : none();
    };

    _setChildren(children) {
        this._children = children && children.isTask && children.isTask() ? some(children._run.bind(children)) : none();
    };

    _triggerUp(resolve, reject) {
        return this._parent.getOrElse(() => this._run(resolve, reject))(resolve, reject);
    };


    _triggerDown(resolve, reject, data) {
        return this._children.getOrElse(() =>resolve(data))(resolve, reject, data);

    };

    _run(resolve, reject, resp) {
        let job = this._task(resp);
        job.then((data) => {
            this._triggerDown(resolve, reject, clone(data));
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

export {Task, task}