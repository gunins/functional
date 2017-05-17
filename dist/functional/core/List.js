(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js'], factory) :
	(factory((global['functional/core/List'] = global['functional/core/List'] || {}, global['functional/core/List'].js = global['functional/core/List'].js || {}),global.__Option_js));
}(this, (function (exports,__Option_js) { 'use strict';

class List {
    constructor(head, ...tail) {
        // split the head and tail pass to new list
        this._create(head, tail.length > 0 ? list(...tail) : __Option_js.none());
    };

    //Private Method
    _create(head, tail) {
        this.head = head !== undefined ? __Option_js.some(head) : __Option_js.none();
        this.tail = tail && tail.isList && tail.isList() && tail.head.isSome && tail.head.isSome() ? tail.copy() : __Option_js.none();
        return this;
    };

    //Private Method
    _reverse(list) {
        let {head, tail} = this;
        if (head.isSome()) {
            let insert = list.insert(head.get());
            if (tail.isSome && !tail.isSome()) {
                return insert;
            } else {
                return tail._reverse(insert);
            }
        } else {
            return list;
        }
    };

    //private method
    _map(fn, i = 0) {
        let {head, tail} = this;
        let empty = List.empty();
        return head.isSome() ? empty._create(fn(head.get(), i), tail.isSome && !tail.isSome() ? __Option_js.none() : tail._map(fn, i + 1)) : empty;
    };

    //private method
    _take(count, i = 1) {
        let {head, tail} = this;
        let empty = List.empty();
        return head.isSome() ? empty._create(head.get(), (tail.isSome && !tail.isSome()) || count <= i ? __Option_js.none() : tail._take(count, i + 1)) : empty;
    }

    //private method
    _flatMap(fn, i = 0) {
        let {head, tail} = this,
            list = head.isSome() ? fn(head.get(), i) : List.empty();
        return tail.isSome && !tail.isSome() ? list : list.concat(tail._flatMap(fn, i));

    };

    //private method
    _filter(fn, list = List.empty()) {
        let {head, tail} = this,
            value = head.get(),
            comparison = fn(value);
        let outList = comparison ? list.insert(value) : list;
        return tail.isList && tail.isList() ? tail._filter(fn, outList) : outList.reverse();
    }

    getOrElse(fn) {
        return this.size() > 0 ? this.map(a => a) : list(fn())
    };

    insert(head) {
        return List.empty()._create(head, this.head ? this : __Option_js.none());
    }

    copy() {
        return this.map(a => a);
    };

    concat(...lists) {
        let empty = List.empty();
        [this].concat(lists).forEach(list => {
            list.forEach(record => {
                empty = empty.insert(record);
            });
        });
        return empty.reverse();
    };

    reverse() {
        let {head} = this,
            empty = List.empty();
        if (!head.isSome()) {
            return empty;
        } else {
            return this._reverse(empty);
        }

    };


    foldLeft(a, fn) {
        let func = fn || a,
            initialValue = fn ? a : undefined,
            {head, tail} = this;
        if (!head.isSome()) {
            return initialValue;
        } else if (head.isSome() && tail.isSome && !tail.isSome()) {
            return func(initialValue, head.get());
        } else {
            return tail.foldLeft(func(initialValue, head.get()), func)
        }
    }

    foldRight(a, fn) {
        return this.reverse().foldLeft(a, fn);
    };

    find(fn) {
        let {head, tail} = this,
            value = head.get(),
            comparison = fn(value);

        return comparison ? value : tail.isList && tail.isList() ? tail.find(fn) : __Option_js.none();
    };


    filter(fn) {
        return this._filter(fn);
    };

    map(fn) {
        return this._map(fn);
    };

    forEach(fn) {
        return this.map(item => {
            fn(item);
            return item;
        })

    }

    flatMap(fn) {
        return this._flatMap(fn);
    };

    size() {
        let count = 0;
        this.forEach(() => count++);
        return count;
    };

    take(count) {
        return this._take(count);
    };

    toString() {
        return '[object List]'
    };

    isList() {
        return this.toString() === '[object List]';
    };

    toArray() {
        let array = [];
        this.forEach(item => array.push(item));
        return array;
    }

    static empty() {
        return list();
    }


}
let list = (...fns) => new List(...fns);

exports.List = List;
exports.list = list;

Object.defineProperty(exports, '__esModule', { value: true });

})));
