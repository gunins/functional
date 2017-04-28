import {some, none} from './Option';
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
        this._task = this._setPromise(job !== undefined ? some(toFunction(job)) : none());
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
        task.then(success).catch(error)
        return task;
    };

    static empty() {
        return task();
    };
}

let task = (...tasks) => new Task(...tasks);

export {Task, task}