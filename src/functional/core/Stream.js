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

    copy() {
        return this.map(a => a);
    };

    map(fn) {
        return this._map(fn);
    };

    toString() {
        return '[object Stream]'
    };

    isStream() {
        return this.toString() === '[object Stream]';
    };
}

let stream = (...tasks) => new Stream(...tasks);

export {Stream, stream}