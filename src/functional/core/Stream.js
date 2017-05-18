import {some, none} from './Option';
import {task} from './Task';
import {List} from './List';

/**
 * Stream is executing asynchronusly, Tasks, with Lazy evaluation.
 * */
let setTask = (fn) => fn && fn.isTask && fn.isTask() ? fn : task(fn),
    emptyFn = () => {
    };
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

    //Private Method
    _reverse(stream) {
        let {head, tail} = this;
        if (head.isSome()) {
            let insert = stream.insert(head.get());
            if (tail.isSome && !tail.isSome()) {
                return insert;
            } else {
                return tail._reverse(insert);
            }
        } else {
            return stream;
        }
    };

    _applyMethod(method, fn) {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty._create(head.get()[method](fn), tail.isSome && !tail.isSome() ? none() : tail._applyMethod(method, fn)) : empty;
    }

    //private method
    _map(fn) {
        return this._applyMethod('map', fn);
    };

    //private method
    //TODO: probably has to flattening stream.
    _flatMap(fn) {
        return this._applyMethod('flatMap', fn);
    };

    //private method
    _through(_task) {
        return this._applyMethod('through', _task);
    };

    //private method
    _resolve(fn) {
        return this._applyMethod('resolve', fn);
    }; //private method

    _reject(fn) {
        return this._applyMethod('reject', fn);
    };

    _forEach(fn) {
        let {head, tail} = this;
        if (head.isSome()) {
            fn(head.get().copy());
        }
        ;

        if (tail && tail.isStream && tail.isStream()) {
            tail._forEach(fn)
        }
    }

    insert(head) {
        return Stream.empty()._create(setTask(head), this.head ? this : none());
    };

    add(head){
        return this.reverse().insert(head).reverse();
    }

    _copy() {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty._create(head.get().copy(), tail.isSome && !tail.isSome() ? none() : tail._copy()) : empty;

    };


    async _run() {
        let {head, tail} = this;
        let empty = List.empty();

        if (head.isSome()) {
            let awaitHEad = await head.get().unsafeRun();
            empty = empty.insert(awaitHEad);
        }

        if (tail.isStream && tail.isStream()) {
            let awaitTail = await tail._run();
            empty = empty.concat(awaitTail);
        }

        return empty;

    };

    copy() {
        return this._copy();
    };


    /**
     * FROM stream(1,2,3) RETURNING stream(task(1),task(2),task(3));
     * */
    map(fn) {
        return this._map(fn);
    };

    flatMap(fn) {
        return this._flatMap(fn);
    };

    async foldLeft(initial, fn) {
        let list = await this.toList();
        return list.foldLeft(initial, fn);
    };

    async foldRight(initial, fn) {
        let list = await this.toList();
        return list.foldRight(initial, fn);
    };

    reverse() {
        let {head} = this,
            empty = Stream.empty();
        if (!head.isSome()) {
            return empty;
        } else {
            return this._reverse(empty);
        }
    };

    concat(...streams) {
        let empty = Stream.empty();
        [this].concat(streams).forEach(stream => {
            stream._forEach(record => {
                empty = empty.insert(record);
            });
        });
        return empty.reverse();
    };

    size() {
        let count = 0
        this._forEach(() => count++);
        return count;
    };

    through(_task) {
        return this._through(_task);
    };

    resolve(fn) {
        return this._resolve(fn);
    };

    reject(fn) {
        return this._reject(fn);
    }

    repeat() {

    };

    zip() {

    };

    isStream() {
        return this.toString() === '[object Stream]';
    };

    async toArray() {
        let streamList = await this.toList();
        return streamList.toArray();
    };

    async toList() {
        return await this._run();
    };

    async unsafeRun() {
        return await this._run();
    }


    toString() {
        return '[object Stream]'
    };

    static empty() {
        return stream();
    };
}

let stream = (...tasks) => new Stream(...tasks);

export {Stream, stream}