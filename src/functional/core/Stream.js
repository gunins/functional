import {some, none} from './Option'
import {task} from './Task'

/**
 * Stream is executing asynchronusly, Tasks, with Lazy evaluation.
 * */
class Stream {
    constructor(head, ...tail) {
        this._create(head, tail.length > 0 ? stream(...tail) : none());
    }

    //private function.
    _create(head, tail) {
        this.head = head !== undefined ? some(head) : none();
        this.tail = tail && tail.isStream && tail.isStream() ? this._setTail(tail) : none();
        return this;
    };

    _setTail(tail) {
        return new Promise(resolve=>{

        })
    }

    //private method
    _map(fn, i = 0) {
        let {head, tail} = this;
        let empty = List.empty();
        return head.isSome() ? empty._create(fn(head.get(), i), tail.isSome && !tail.isSome() ? none() : tail._map(fn, i + 1)) : empty;
    };
    toString() {
        return '[object Stream]'
    };

    copy() {
        return this.map(a => a);
    };
    /**
     * FROM stream(1,2,3) RETURNING stream(fn(1),fn(2),fn(3));
     * */
    map(fn) {
        return this._map(fn);
    };

    flatMap(fn){

    };

    size(){

    };

    unsafeRun(){

    };

    isStream() {
        return this.toString() === '[object Stream]';
    };
}

let stream = (...tasks) => new Stream(...tasks);

export {Stream, stream}