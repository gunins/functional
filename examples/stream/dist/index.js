(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.index = {})));
}(this, (function (exports) { 'use strict';

const some = (value) => new Some(value);
const none = () => new None();

class Some {
    constructor(value) {
        this.value = value;
    };

    isSome() {
        return ['[object Some]'].indexOf(this.toString()) !== -1
    };

    isOption() {
        return ['[object Some]', '[object None]'].indexOf(this.toString()) !== -1;
    }

    get() {
        return this.value;
    };

    map(fn) {
        return this.isSome() ? some(fn(this.get())) : none();
    };

    flatMap(fn) {
        const out = fn(this.get());
        if (out.isOption) {
            return out;
        }else{
            throw new ReferenceError('Must return an Option');
        }

    }

    set(value) {
        return some(value);
    };

    isEmpty() {
        return this.value ? false : true;
    };

    getOrElse(defaultVal) {
        return this.isSome() ? this.value : defaultVal
    };

    toString() {
        return '[object Some]';
    };
}

class None extends Some {
    constructor() {
        super();
    };

    isSome() {
        return false;
    };

    set(value) {
        return none();
    };

    toString() {
        return '[object None]';
    };

}

//Define Private methods;
const _create$1 = Symbol('_create');
const _reverse = Symbol('_reverse');
const _map$1 = Symbol('_map');
const _take = Symbol('_take');
const _flatMap$1 = Symbol('_flatMap');
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
        this[_create$1](head, tail.length > 0 ? list(...tail) : none());
    };

    //Private Method
    [_create$1](head, tail) {
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
    [_map$1](fn, i = 0) {
        const {head, tail} = this;
        const empty = List.empty();
        return hasHead(head) ? empty[_create$1](fn(head.get(), i), noTail(tail) ? none() : tail[_map$1](fn, i + 1)) : empty;
    };

    //private method
    [_take](count, i = 1) {
        const {head, tail} = this;
        const empty = List.empty();
        return hasHead(head) ? empty[_create$1](head.get(), (noTail(tail)) || count <= i ? none() : tail[_take](count, i + 1)) : empty;
    }

    //private method
    [_flatMap$1](fn, i = 0) {
        const {head, tail} = this;
        const list = hasHead(head) ? fn(head.get(), i) : List.empty();
        return noTail(tail) ? list : list.concat(tail[_flatMap$1](fn, i));

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
        return List.empty()[_create$1](head, this.head ? this : none());
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
        return this[_map$1](fn);
    };

    forEach(fn) {
        return this.map(item => {
            fn(item);
            return item;
        })

    }

    flatMap(fn) {
        return this[_flatMap$1](fn);
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

const {assign, keys} = Object;

const pair = (guard, action) => ({guard, action});

// map method for Objects
const objCopy = (obj, fn) => keys(obj).reduce((initial, attr) => assign(initial, {[attr]: fn(obj[attr])}), {});

const isDate = (obj) => Object.prototype.toString.call(obj) === '[object Date]';
const isArray = (obj) => Object.prototype.toString.call(obj) === '[object Array]';
const isObject = (obj) => (!!obj) && (obj.constructor === Object);
const isOther = (obj) => !isDate(obj) && !isArray(obj) && !isObject(obj);

// Cloning actions, for different types
//All imutable references returning same instance
const cloneSimple = (simple) => () => simple;
const cloneDate = (date) => () => new Date(date.getTime());
const cloneArray = (arr) => (fn) => arr.map(fn);
const cloneObj = (obj) => (fn) => objCopy(obj, fn);

// Define functors, with guards and actions
const arrayFunctor = pair(isArray, cloneArray);
const dateFunctor = pair(isDate, cloneDate);
const objectFunctor = pair(isObject, cloneObj);
const otherFunctor = pair(isOther, cloneSimple);

//take all functors in a list.
const functors = list(arrayFunctor, dateFunctor, objectFunctor, otherFunctor);
const getFunctor = (obj) => functors.find(fn => fn.guard(obj)).action(obj);
const clone = (obj) => getFunctor(obj)(children => clone(children));

let isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
let toFunction = (job) => isFunction(job) ? job : (_, resolve) => resolve(job);
let emptyFn = () => {
    };
/**
 * Task class is for asyns/sync jobs. You can provide 3 types on tasks
 *      @Task((resolve,reject)=>resolve()) // resolve reject params
 *      @Task(()=>3) synchronus function with returning value !important argumentList have to be empty
 *      @Task(3) // Static values
 * */
//Define Private methods;
const _parent = Symbol('_parent');
const _topRef = Symbol('_topRef');
const _topParent = Symbol('_topParent');
const _children = Symbol('_children');
const _resolvers = Symbol('_resolvers');
const _rejecters = Symbol('_rejecters');
const _resolve = Symbol('_resolve');
const _reject = Symbol('_reject');
const _bottomRef = Symbol('_bottomRef');
const _uuid = Symbol('_uuid');
const _create = Symbol('_create');
const _task = Symbol('_task');
const _setPromise = Symbol('_setPromise');
const _setParent = Symbol('_setParent');
const _addParent = Symbol('_addParent');
const _setChildren = Symbol('_setChildren');
const _resolveRun = Symbol('_resolveRun');
const _rejectRun = Symbol('_rejectRun');
const _triggerUp = Symbol('_triggerUp');
const _triggerDown = Symbol('_triggerDown');
const _run = Symbol('_run');
const _map = Symbol('_map');
const _flatMap = Symbol('_flatMap');
const _copyJob = Symbol('_copyJob');
const _getTopRef = Symbol('_getTopRef');
const _getBottomRef = Symbol('_getBottomRef');
const _copy = Symbol('_copy');

class Task {

    constructor(job, parent) {
        this[_parent] = none();
        this[_topRef] = none();
        this[_topParent] = none();
        this[_children] = List.empty();
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();
        this[_resolve] = none();
        this[_reject] = none();
        this[_bottomRef] = none();
        this[_uuid] = Symbol('uuid');
        this[_create](job, parent);
    }

    //private function.
    [_create](job, parent) {
        this[_setParent](parent);
        this[_task] = job !== undefined ? some(toFunction(job)) : none();
        return this;
    };

    [_setPromise](job) {
        return (data, res) => new Promise((resolve, reject) => {
            let out = clone(data),
                fn = job.getOrElse((_, resolve) => resolve(out));
            if (res) {
                return (fn.length <= 1) ? resolve(fn(out)) : fn(out, resolve, reject);
            } else {
                return reject(out);
            }
        });
    };

    [_setParent](parent) {
        if (parent && parent.isTask && parent.isTask()) {
            this[_parent] = some(parent[_triggerUp].bind(parent));
            this[_topRef] = some(parent[_getTopRef].bind(parent));
            this[_topParent] = some(parent[_addParent].bind(parent));
        }
    };

    [_addParent](parent) {
        this[_topParent].getOrElse((parent) => {
            parent[_setChildren](this);
            this[_setParent](parent);
        })(parent);
    };

    [_setChildren](children) {
        if (children && children.isTask && children.isTask()) {
            this[_children] = this[_children].insert(children[_run].bind(children));
            this[_bottomRef] = some(children[_getBottomRef].bind(children));
        }

    };

    [_resolveRun](data) {
        this[_resolvers].forEach(fn => fn(data));
        this[_resolve].getOrElse(emptyFn)(clone(data));
        this[_resolve] = none();
        this[_triggerDown](data, true);
        return clone(data);
    };

    [_rejectRun](data) {
        this[_rejecters].forEach(fn => fn(clone(data)));
        this[_reject].getOrElse(emptyFn)(clone(data));
        this[_reject] = none();
        this[_triggerDown](data, false);
        return clone(data);
    };

    [_triggerUp]() {
        return this[_parent].getOrElse(() => this[_run]())();
    };


    [_triggerDown](data, resolve) {
        this[_children].map(child => child(data, resolve));
    };

    [_run](resp, resolve = true) {
        return this[_setPromise](this[_task])(resp, resolve)
            .then(this[_resolveRun].bind(this))
            .catch(this[_rejectRun].bind(this));
    };

    [_map](fn) {
        let job = task(fn, this);
        this[_setChildren](job);
        return job;
    };

    [_flatMap](fn) {
        return this[_map](fn)
            .map((responseTask, res, rej) => {
                if (!(responseTask.isTask && responseTask.isTask())) {
                    rej('flatMap has to return task');
                }
                responseTask.unsafeRun().then(res).catch(rej);
            });
    };

    [_copyJob](parent) {
        let job = task(this[_task].get(), parent);
        job[_resolvers] = this[_resolvers];
        job[_rejecters] = this[_rejecters];


        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_getTopRef](uuid, parent) {
        return this[_topRef].getOrElse((uuid, parent) => this[_copy](uuid, parent))(uuid, parent);
    };

    [_getBottomRef](uuid, parent, goNext = false) {
        let copyJob = goNext ? parent : this[_copyJob](parent);
        let next = goNext || this[_uuid] === uuid ? true : false;
        return this[_bottomRef].getOrElse((uuid, job) => job)(uuid, copyJob, next);
    }

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };

    copy() {
        return this[_getTopRef](this[_uuid]);
    };


    map(fn) {
        return this[_map](fn);
    };

    flatMap(fn) {
        return this[_flatMap](fn)
    };

    through(joined) {
        let clone$$1 = joined.copy();
        clone$$1[_addParent](this);
        return clone$$1;
    };

    forEach(fn) {
        return this.map((d, res) => {
            fn(d);
            res(d);
        });
    };

    resolve(fn) {
        this[_resolvers] = this[_resolvers].insert(fn);
        return this;
    };

    reject(fn) {
        this[_rejecters] = this[_rejecters].insert(fn);
        return this;
    }

    isTask() {
        return this.toString() === '[object Task]';
    }

    toString() {
        return '[object Task]'
    };

    clear() {
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();
        return this;
    }

    /**
     * Method running executor and return Promise.
     * @param resolve executed when resolved
     * @param reject executed when rejected
     * */
    unsafeRun(resolve = emptyFn, reject = emptyFn) {
        return new Promise((res, rej) => {
            this[_resolve] = some((data) => {
                resolve(data);
                res(data);
            });
            this[_reject] = some((data) => {
                reject(data);
                rej(data);
            });
            this[_triggerUp]();
        });
    };


    static empty() {
        return task();
    };

    static all(tasks = [], context = {}) {
        return task()
            .flatMap(() => task(
                Promise.all(
                    tasks.map(_ => task(context)
                        .through(_)
                        .unsafeRun())
                )
            ));
    }
}

let task = (...tasks) => new Task(...tasks);

/**
 * Stream is executing asynchronusly, Tasks, with Lazy evaluation.
 * */
let setTask = (fn) => fn && fn.isTask && fn.isTask() ? fn : task(fn);
//Define Private methods
const _create$2 = Symbol('_create');
const _reverse$1 = Symbol('_reverse');
const _applyMethod = Symbol('_applyMethod');
const _map$2 = Symbol('_map');
const _flatMap$2 = Symbol('_flatMap');
const _through = Symbol('_through');
const _resolve$1 = Symbol('_resolve');
const _reject$1 = Symbol('_reject');
const _forEach = Symbol('_forEach');
const _run$1 = Symbol('_run');

class Stream {
    constructor(head, ...tail) {
        this[_create$2](head, tail.length > 0 ? stream(...tail) : none());
    }

    //private function.
    [_create$2](head, tail) {
        this.head = head !== undefined ? some(setTask(head)) : none();
        this.tail = tail && tail.isStream && tail.isStream() ? tail.copy() : none();
        return this;
    };

    //Private Method
    [_reverse$1](stream) {
        let {head, tail} = this;
        if (head.isSome()) {
            let insert = stream.insert(head.get());
            if (tail.isSome && !tail.isSome()) {
                return insert;
            } else {
                return tail[_reverse$1](insert);
            }
        } else {
            return stream;
        }
    };

    [_applyMethod](method, fn) {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty[_create$2](head.get()[method](fn), tail.isSome && !tail.isSome() ? none() : tail[_applyMethod](method, fn)) : empty;
    }

    //private method
    [_map$2](fn) {
        return this[_applyMethod]('map', fn);
    };

    //private method
    //TODO: probably has to flattening stream.
    [_flatMap$2](fn) {
        return this[_applyMethod]('flatMap', fn);
    };

    //private method
    [_through](_task) {
        return this[_applyMethod]('through', _task);
    };

    //private method
    [_resolve$1](fn) {
        return this[_applyMethod]('resolve', fn);
    }; //private method

    [_reject$1](fn) {
        return this[_applyMethod]('reject', fn);
    };

    [_forEach](fn) {
        let {head, tail} = this;
        if (head.isSome()) {
            fn(head.get().copy());
        }
        

        if (tail && tail.isStream && tail.isStream()) {
            tail[_forEach](fn);
        }
    }

    insert(head) {
        return Stream.empty()[_create$2](setTask(head), this.head ? this : none());
    };

    add(head) {
        return this.reverse().insert(head).reverse();
    }

    _copy() {
        let {head, tail} = this;
        let empty = Stream.empty();
        return head.isSome() ? empty[_create$2](head.get().copy(), tail.isSome && !tail.isSome() ? none() : tail._copy()) : empty;

    };


    async [_run$1]() {
        let {head, tail} = this;
        let empty = List.empty();

        if (head.isSome()) {
            let awaitHEad = await head.get().unsafeRun();
            empty = empty.insert(awaitHEad);
        }

        if (tail.isStream && tail.isStream()) {
            let awaitTail = await tail[_run$1]();
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
        return this[_map$2](fn);
    };

    flatMap(fn) {
        return this[_flatMap$2](fn);
    };

    async foldLeft(initial, fn) {
        let list$$1 = await this.toList();
        return list$$1.foldLeft(initial, fn);
    };

    async foldRight(initial, fn) {
        let list$$1 = await this.toList();
        return list$$1.foldRight(initial, fn);
    };

    reverse() {
        let {head} = this,
            empty = Stream.empty();
        if (!head.isSome()) {
            return empty;
        } else {
            return this[_reverse$1](empty);
        }
    };

    concat(...streams) {
        let empty = Stream.empty();
        [this].concat(streams).forEach(stream => {
            stream[_forEach](record => {
                empty = empty.insert(record);
            });
        });
        return empty.reverse();
    };

    size() {
        let count = 0;
        this[_forEach](() => count++);
        return count;
    };

    through(_task) {
        return this[_through](_task);
    };

    resolve(fn) {
        return this[_resolve$1](fn);
    };

    reject(fn) {
        return this[_reject$1](fn);
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
        return await this[_run$1]();
    };

    async unsafeRun() {
        return await this[_run$1]();
    }


    toString() {
        return '[object Stream]'
    };

    static empty() {
        return stream();
    };
}

let stream = (...tasks) => new Stream(...tasks);

const {assign: assign$1} = Object;

const load = async (opt) => {
    const res = await fetch(opt.uri, assign$1({}, opt, {
        headers: assign$1({
            'Accept':       'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }, opt && opt.headers ? opt.headers : {})
    }));
    return res.json();
};
const str = obj => Object.keys(obj)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');

const fetchTask = task(opt => load(opt));

const uriPath = ({protocol, host, uri}) => (host && protocol ? protocol.replace(':', '') + `://` + host + uri : uri);

const getBase = task(opt => {
    const {uri, body} = opt;
    return assign$1(
        {credentials: 'include'},
        opt,
        {
            uri:  uriPath(opt) + (uri.indexOf('?') === -1 && body ? '?' + str(body) : ''),
            body: undefined
        }
    )
});
const get = getBase.copy()
    .map(opt => assign$1(
        {method: 'get'},
        opt
    ))
    .through(fetchTask);

const del = getBase.copy()
    .map(opt => assign$1(
        {method: 'delete'},
        opt
    ))
    .through(fetchTask);


const postBase = task(opt => assign$1(
    {
        method:      'post',
        credentials: 'include',
    },
    opt,
    {
        body: JSON.stringify(opt.body || {}),
        uri:  uriPath(opt)
    }));
const post = postBase.copy()
    .map(opt => assign$1(
        opt,
        {method: 'post'}
    ))
    .through(fetchTask);

const put = postBase.copy()
    .map(opt => assign$1(
        opt,
        {method: 'put'}
    ))
    .through(fetchTask);

/*define uri for rest request and return data also added shortcut for copy. Because this task required new every time initialised. */
let count = 0;
let request = () => task({uri: './products.json'}).through(get).copy();

/*create new task, with function to apply new Id on each item*/
let addId = task((tmpl) => ({
    id:   tmpl.id,
    data: tmpl.data.map(item => Object.assign(item, {id: count++}))
}));

exports.request = request;
exports.addId = addId;
exports.stream = stream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
