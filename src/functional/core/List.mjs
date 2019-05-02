import {some, none} from './Maybe.mjs';

//Define Private methods;
const _create = Symbol('_create');
const _reverse = Symbol('_reverse');
const _map = Symbol('_map');
const _take = Symbol('_take');
const _flatMap = Symbol('_flatMap');
const _filter = Symbol('_filter');

const hasTail = (tail) => tail && tail.isList && tail.isList();
const hasHead = (head) => head && head.isSome && head.isSome();
const noTail = (tail) => tail && tail.isSome && !tail.isSome();
const tailHasSize = (tail) => hasTail(tail) && hasHead(tail.head);

const flatList = (left, list) => list
    .foldLeft(left, (_, record) => _.insert(record));

class List {
    constructor(head, ...tail) {
        // split the head and tail pass to new list
        this[_create](head, tail.length > 0 ? list(...tail) : none());
    };

    //Private Method
    [_create](head, tail) {
        this.head = head !== undefined ? some(head) : none();
        this.tail = tailHasSize(tail) ? tail : none();
        return this;
    };

    //Private Method
    [_reverse](list) {
        const {head, tail} = this;
        if (head.isSome()) {
            const insert = list.insert(head.get());
            if (noTail(tail)) {
                return insert;
            } else {
                return tail[_reverse](insert);
            }
        } else {
            return list;
        }
    };

    //private method
    [_map](fn, i = 0) {
        const {head, tail} = this;
        const empty = List.empty();
        return hasHead(head) ? empty[_create](fn(head.get(), i), noTail(tail) ? none() : tail[_map](fn, i + 1)) : empty;
    };

    //private method
    [_take](count, i = 1) {
        const {head, tail} = this;
        const empty = List.empty();
        return hasHead(head) ? empty[_create](head.get(), (noTail(tail)) || count <= i ? none() : tail[_take](count, i + 1)) : empty;
    }

    //private method
    [_flatMap](fn, i = 0) {
        const {head, tail} = this;
        const list = hasHead(head) ? fn(head.get(), i) : List.empty();
        return noTail(tail) ? list : list.concat(tail[_flatMap](fn, i));

    };

    //private method
    [_filter](fn, list = List.empty()) {
        const {head, tail} = this;
        const value = head.get();
        const comparison = fn(value);
        const outList = comparison ? list.insert(value) : list;
        return tail.isList && tail.isList() ? tail[_filter](fn, outList) : outList.reverse();
    }

    getOrElse(fn) {
        return this.size() > 0 ? this.map(a => a) : list(fn())
    };

    insert(head) {
        return List.empty()[_create](head, this.head ? this : none());
    }

    add(head) {
        return this.reverse().insert(head).reverse();
    }

    copy() {
        return this.map(a => a);
    };

    concat(...lists) {
        const listArray = [this, ...lists];
        return listArray
            .reduce(flatList, List.empty())
            .reverse();
    };

    reverse() {
        const {head} = this;
        const empty = List.empty();
        if (!head.isSome()) {
            return empty;
        } else {
            return this[_reverse](empty);
        }

    };


    foldLeft(a, fn) {
        const func = fn || a;
        const initialValue = fn ? a : undefined;
        const {head, tail} = this;
        if (!head.isSome()) {
            return initialValue;
        } else if (head.isSome() && noTail(tail)) {
            return func(initialValue, head.get());
        } else {
            return tail.foldLeft(func(initialValue, head.get()), func)
        }
    }

    foldRight(a, fn) {
        return this
            .reverse()
            .foldLeft(a, fn);
    };

    find(fn) {
        const {head, tail} = this;
        const value = head.get();
        const comparison = fn(value);
        return comparison ? value : hasTail(tail) ? tail.find(fn) : none();
    };


    filter(fn) {
        return this[_filter](fn);
    };

    map(fn) {
        return this[_map](fn);
    };

    forEach(fn) {
        return this.map(item => {
            fn(item);
            return item;
        })

    }

    flatMap(fn) {
        return this[_flatMap](fn);
    };

    size() {
        return this.foldLeft(0, _ => ++_);
    };

    take(count) {
        return this[_take](count);
    };

    toString() {
        return '[object List]'
    };

    isList() {
        return this.toString() === '[object List]';
    };

    toArray() {
        return this.foldLeft([], (_, value) => [..._, value]);
    }

    static empty() {
        return list();
    }


}

const list = (...fns) => new List(...fns);

export {List, list}
