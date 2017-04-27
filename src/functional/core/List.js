import {some, none} from './Option'

class List {
    constructor(head, ...tail) {
        // split the head and tail pass to new list
        this._create(head, tail.length > 0 ? list(...tail) : none());
    };

    //Private Method
    _create(head, tail) {
        this.head = head !== undefined ? some(head) : none();
        this.tail = tail && tail.copy ? tail.copy() : none();
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
    }

    getOrElse(obj) {
        let head = this.head,
            tail = this.tail,
            result = head.getOrElse(obj);
        return result.isSome() ? result : tail.getOrElse(obj)
    };

    insert(head) {
        return List.empty()._create(head, this.head ? this : none());
    }

    copy() {
        return this.map(a => a);
    };

    concat(...lists) {
        let empty = List.empty();
        [this].concat(lists).forEach(list => {
            list.map(record => {
                empty = empty.insert(record);
                return record;
            });
        });
        return empty.reverse();
    };

    reverse() {
        let {head} = this;
        let empty = List.empty();
        if (!head.isSome()) {
            return empty;
        } else {
            return this._reverse(empty);
        }

    };

    isList() {
        return this.toString() === '[object List]';
    }

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
    }

    map(fn, i = 0) {
        let {head, tail} = this;
        let empty = List.empty();
        return head.isSome() ? empty._create(fn(head.get(), i), tail.isSome && !tail.isSome() ? none() : tail.map(fn, i + 1)) : empty;
    }

    flatMap(fn, i = 0) {
        let {head, tail} = this,
            list = head.isSome() ? fn(head.get(), i) : List.empty();
        return tail.isSome && !tail.isSome() ? list : list.concat(tail.flatMap(fn, i));

    }

    size() {
        let count = 0
        return this.map(() => count++);
    }

    toArray() {
        let array = [];
        this.map(item => array.push(item));
        return array;
    }

    static empty() {
        return list();
    }

    toString() {
        return '[object List]'
    }

}
let list = (...fns) => new List(...fns);

export {List, list}