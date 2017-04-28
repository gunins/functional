import {some, none} from './Option';
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

    /**
     * Method running executor and return Promise.
     * @param resolve executed when resolved
     * @param reject executed when rejected
     * */
    unsafeRun(resolve = emptyFn, reject = emptyFn) {
        let task = this._task();
        task.then(resolve).catch(reject)
        return task;
    };

    static empty() {
        return task();
    };
}

let task = (...tasks) => new Task(...tasks);

export {Task, task}