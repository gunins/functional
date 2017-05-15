import {some, none} from './Option'
import {task} from './Task'

/**
 * Stream is executing asynchronusly, Tasks, with Lazy evaluation.
 * */
let setTask = (fn) => fn && fn.isTask && fn.isTask() ? fn : task(fn);
class Stream {
    constructor(head, ...tail) {
        this._create(head, tail.length > 0 ? stream(...tail) : none());
    }

    //private function.
    _create(head, tail) {
        this.head = head !== undefined ? some(setTask(head)) : none();
        this.tail = tail && tail.isStream && tail.isStream() ? tail.copy() : none();
        return this;
    };

    //private method
    async _map(fn) {
        let {head, tail} = this;
        let empty = Stream.empty();
        if (head.isSome()) {
            let applyHead = await head.get().map(fn).unsafeRun();
            return empty._create(applyHead, tail.isSome && !tail.isSome() ? none() : tail._map(fn));
        } else {
            return empty;
        }
    };

    insert(head) {
        return Stream.empty()._create(setTask(head), this.head ? this : none());
    };

    _copy() {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty._create(head.get(), tail.isSome && !tail.isSome() ? none() : tail._copy()) : empty;

    };

    copy() {
        return this._copy();
    }

    /**
     * FROM stream(1,2,3) RETURNING stream(fn(1),fn(2),fn(3));
     * */
    map(fn) {
        return this._map(fn);
    };

    flatMap(fn) {

    };

    foldLeft() {
    };

    foldRight() {
    };

    reverse() {
    };

    concat() {
    };

    toArray() {
    };

    size() {

    };

    unsafeRun() {

    };

    isStream() {
        return this.toString() === '[object Stream]';
    };

    toString() {
        return '[object Stream]'
    };

    static empty() {
        return stream();
    };
}

let stream = (...tasks) => new Stream(...tasks);

export {Stream, stream}