(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

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

    getOrElseLazy(defaultVal=()=>{}) {
        return this.isSome() ? this.value : defaultVal()
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
const _create$2 = Symbol('_create');
const _reverse = Symbol('_reverse');
const _map = Symbol('_map');
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
        this[_create$2](head, tail.length > 0 ? list(...tail) : none());
    };

    //Private Method
    [_create$2](head, tail) {
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
        return hasHead(head) ? empty[_create$2](fn(head.get(), i), noTail(tail) ? none() : tail[_map](fn, i + 1)) : empty;
    };

    //private method
    [_take](count, i = 1) {
        const {head, tail} = this;
        const empty = List.empty();
        return hasHead(head) ? empty[_create$2](head.get(), (noTail(tail)) || count <= i ? none() : tail[_take](count, i + 1)) : empty;
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
        return List.empty()[_create$2](head, this.head ? this : none());
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

const isFunction$1 = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
const toFunction$1 = (job) => isFunction$1(job) ? job : () => job;
const emptyFn$1 = _ => _;
const setPromise$1 = (job) => (data, success) => new Promise((resolve, reject) => {
    const dataCopy = clone(data);
    const fn = job.getOrElse(emptyFn$1);
    if (success) {
        return (fn.length <= 1) ? resolve(fn(dataCopy)) : fn(dataCopy, resolve, reject);
    } else {
        return reject(dataCopy);
    }
});
/**
 * Task class is for asyns/sync jobs. You can provide 3 types on tasks
 *      @Task((resolve,reject)=>resolve()) // resolve reject params
 *      @Task(()=>3) synchronus function with returning value !important argumentList have to be empty
 *      @Task(3) // Static values
 * */
//Define Private methods;
const _parent$1 = Symbol('_parent');
const _topRef$1 = Symbol('_topRef');
const _topParent$1 = Symbol('_topParent');
const _children = Symbol('_children');
const _resolvers = Symbol('_resolvers');
const _rejecters = Symbol('_rejecters');
const _resolve = Symbol('_resolve');
const _reject = Symbol('_reject');
const _bottomRef$1 = Symbol('_bottomRef');
const _uuid$1 = Symbol('_uuid');
const _create$1 = Symbol('_create');
const _task = Symbol('_task');
const _setPromise = Symbol('_setPromise');
const _setParent$1 = Symbol('_setParent');
const _addParent$1 = Symbol('_addParent');
const _setChildren$1 = Symbol('_setChildren');
const _resolveRun = Symbol('_resolveRun');
const _rejectRun = Symbol('_rejectRun');
const _triggerUp$1 = Symbol('_triggerUp');
const _triggerDown$1 = Symbol('_triggerDown');
const _run$1 = Symbol('_run');
const _flatMap = Symbol('_flatMap');
const _copyJob$1 = Symbol('_copyJob');
const _getTopRef$1 = Symbol('_getTopRef');
const _getBottomRef$1 = Symbol('_getBottomRef');
const _copy$1 = Symbol('_copy');

class Task {

    constructor(job, parent) {
        this[_parent$1] = none();
        this[_topRef$1] = none();
        this[_topParent$1] = none();
        this[_children] = List.empty();
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();
        this[_resolve] = none();
        this[_reject] = none();
        this[_bottomRef$1] = none();
        this[_uuid$1] = Symbol('uuid');
        this[_create$1](job, parent);
    }

    //private function.
    [_create$1](job, parent) {
        this[_setParent$1](parent);
        this[_task] = job !== undefined ? some(toFunction$1(job)) : none();
        return this;
    };

    [_setPromise](job) {
        return setPromise$1(job);
    };

    [_setParent$1](parent) {
        if (parent && parent.isTask && parent.isTask()) {
            this[_parent$1] = some((..._) => parent[_triggerUp$1](..._));
            this[_topRef$1] = some((..._) => parent[_getTopRef$1](..._));
            this[_topParent$1] = some((..._) => parent[_addParent$1](..._));
        }
    };

    [_addParent$1](parent) {
        this[_topParent$1].getOrElse((parent) => {
            parent[_setChildren$1](this);
            this[_setParent$1](parent);
        })(parent);
        return this;
    };

    [_setChildren$1](children) {
        if (children && children.isTask && children.isTask()) {
            this[_children] = this[_children].insert((..._) => children[_run$1](..._));
            this[_bottomRef$1] = some((..._) => children[_getBottomRef$1](..._));
        }

    };

    [_resolveRun](data) {
        this[_resolvers].forEach(fn => fn(data));
        this[_resolve].getOrElse(emptyFn$1)(clone(data));
        this[_resolve] = none();
        this[_triggerDown$1](data, true);
        return clone(data);
    };

    [_rejectRun](data) {
        this[_rejecters].forEach(fn => fn(clone(data)));
        this[_reject].getOrElse(emptyFn$1)(clone(data));
        this[_reject] = none();
        this[_triggerDown$1](data, false);
        return clone(data);
    };

    [_triggerUp$1]() {
        return this[_parent$1].getOrElse(() => this[_run$1]())();
    };


    [_triggerDown$1](data, resolve) {
        this[_children].map(child => child(data, resolve));
    };

    [_run$1](data, success = true) {
        return this[_setPromise](this[_task])(data, success)
            .then((_) => this[_resolveRun](_))
            .catch((_) => this[_rejectRun](_));
    };

    [_flatMap](fn) {
        return this
            .map(fn)
            .map((responseTask) => {
                if (!(responseTask.isTask && responseTask.isTask())) {
                    return Promise.reject('flatMap has to return task');
                }
                return responseTask.unsafeRun();
            });
    };

    [_copyJob$1](parent) {
        const job = task(this[_task].get(), parent);
        job[_resolvers] = this[_resolvers];
        job[_rejecters] = this[_rejecters];

        if (parent) {
            parent[_setChildren$1](job);
        }
        return job;
    };

    [_getTopRef$1](uuid, parent) {
        return this[_topRef$1]
            .getOrElse((uuid, parent) => this[_copy$1](uuid, parent))(uuid, parent);
    };

    [_getBottomRef$1](uuid, parent, goNext = false) {
        const copyJob = goNext ? parent : this[_copyJob$1](parent);
        const next = goNext || this[_uuid$1] === uuid;
        return this[_bottomRef$1].getOrElse((uuid, job) => job)(uuid, copyJob, next);
    }

    [_copy$1](uuid) {
        return this[_getBottomRef$1](uuid);
    };

    copy() {
        return this[_getTopRef$1](this[_uuid$1]);
    };


    map(fn) {
        const job = task(fn, this);
        this[_setChildren$1](job);
        return job;
    };

    flatMap(fn) {
        return this[_flatMap](fn)
    };

    through(joined) {
        return joined
            .copy()
            [_addParent$1](this);
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
    unsafeRun(resolve = emptyFn$1, reject = emptyFn$1) {
        return new Promise((res, rej) => {
            this[_resolve] = some((data) => {
                resolve(data);
                res(data);
            });
            this[_reject] = some((data) => {
                reject(data);
                rej(data);
            });
            this[_triggerUp$1]();
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

const task = (...tasks) => new Task(...tasks);

const lambda = () => {
};
//Option will find true statement and returning result (Call by Value)
const option = (...methods) => ({
    or(bool, left) {
        return option(...methods, {bool, left})
    },
    finally(right = lambda) {
        const {left} = methods.find(({bool}) => bool) || {};
        return left ? left() : right();
    }
});

//stream lifecycle types
const RUN_TYPE = Symbol('RUN_TYPE');
const STOP_TYPE = Symbol('STOP_TYPE');
const ERROR_TYPE = Symbol('ERROR_TYPE');
const TOP_INSTANCE = Symbol('TOP_INSTANCE');
const EMPTY_DATA = Symbol('NO_DATA');

const isStream = (_ = {}) => _ && _.isStream && _.isStream();
const isMaybe = (_ = {}) => _ && _.isOption && _.isOption();
const isDefined = (_) => _ !== undefined;
const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
const toFunction = (job) => option()
    .or(isFunction(job), () => some(job))
    .or(isDefined(job), () => some(() => job))
    .finally(() => none());

const emptyFn = _ => _;

const toMaybe = (value) => option()
    .or(isMaybe(value), () => value)
    .or(!isDefined(value), () => none())
    .finally(() => some(value));

const storage = (copy) => {
    const store = new Map(copy);
    return {
        get(key) {
            return store.get(key) || none()
        },
        set(key, value) {
            const data = toMaybe(value);
            store.set(key, data);
            return data;
        },
        has(key) {
            return store.has(key);
        },
        once(key) {
            const context = store.get(key) || none();
            store.delete(key);
            return context;
        },
        delete(key) {
            return store.delete(key);
        },
        clear() {
            store.clear();
        },
        copy() {
            return storage(store);
        }

    }
};

const getRoot = (instance, onReady) => option()
    .or(onReady.isSome(), () => instance.get()())
    .finally(() => instance.get());


const applyStep = cb => _ => {
    cb(_);
    return _;
};

const getContext = (context, field) => () => context.get(field).get();
const setContext = (context, field) => applyStep(_ => context.set(field, _));

const toPromise = (cb) => (...args) => Promise.resolve(cb(...args));

const setPromise = (streamInstance, context) => (data, type) => {
    const instance = streamInstance.get(_instance);
    const onReady = streamInstance.get(_onReady);
    const onData = streamInstance.get(_onData);

    const rootContext = setContext(context, _root);
    const setStreamContext = setContext(context, _context);
    const getStreamContext = getContext(context, _context);

    const root = context
        .get(_root)
        .getOrElseLazy(() => rootContext(getRoot(instance, onReady)));

    return Promise.resolve(root)
        .then((root) => onReady.getOrElse(() => root(data))(root, data))
        .then((_) => setStreamContext(
            onData
                .getOrElse(emptyFn)(_, getStreamContext()))
        )


};
const topInstance = (data, type) => data === TOP_INSTANCE;
const noData = (data, type) => !data;
const isEmptyData = (data) => data === EMPTY_DATA;
const isError = (data, type) => type === ERROR_TYPE;
const isStop = (data, type) => type === STOP_TYPE;
const isRun = (data, type) => type === RUN_TYPE;
const stopNoData = (data, type) => !topInstance(data, type) && noData(data, type) && isRun(data, type);


/**
 * Stream is executing asynchronusly.
 * */

//Define Private methods
const _parent = Symbol('_parent');
const _topRef = Symbol('_topRef');
const _topParent = Symbol('_topParent');
const _child = Symbol('_child');
const _bottomRef = Symbol('_bottomRef');
const _uuid = Symbol('_uuid');
const _create = Symbol('_create');
const _setParent = Symbol('_setParent');
const _addParent = Symbol('_addParent');
const _setChildren = Symbol('_setChildren');
const _error = Symbol('_error');
const _stopStep = Symbol('_stopStep');
const _stop = Symbol('_stop');
const _triggerUp = Symbol('_triggerUp');
const _triggerDown = Symbol('_triggerDown');
const _run = Symbol('_run');
const _copyJob = Symbol('_copyJob');
const _getTopRef = Symbol('_getTopRef');
const _getBottomRef = Symbol('_getBottomRef');
const _copy = Symbol('_copy');
const _executeStep = Symbol('_executeStep');
const _onStreamFinish = Symbol('_onStreamFinish');
const _onStreamError = Symbol('_onStreamError');

const _onStreamFinishHandlers = Symbol('_onStreamFinishHandlers');
const _onStreamErrorHandlers = Symbol('_onStreamErrorHandlers');

const _refs = Symbol('_refs');
const _stream = Symbol('_stream');
const _setStream = Symbol('_setStream');

const _clearContext = Symbol('_clearContext');
const _root = Symbol('_root');
const _context = Symbol('_context');
const _getContext = Symbol('_getContext');
const _contextStorage = Symbol('_contextStorage');

const _instance = Symbol('_instance');
const _onReady = Symbol('_onReady');
const _onPause = Symbol('_onPause');
const _onResume = Symbol('_onResume');
const _onStop = Symbol('_onStop');
const _onData = Symbol('_onData');
const _onError = Symbol('_onError');

const setContextStorage = (context, contextID) => context.set(contextID, storage()).get(contextID);


class Stream {
    // job will return stream instance. In case onReady not defined, shortcut for.map method.
    // for non stream instances better to use tasks.

    constructor(job, parent) {
        this[_uuid] = Symbol('uuid');
        this[_refs] = storage();
        this[_stream] = storage();
        this[_contextStorage] = new Map();
        this[_onStreamFinishHandlers] = storage();
        this[_onStreamErrorHandlers] = storage();
        this[_create](job, parent);
    }

    [_clearContext](contextID) {
        const contextContainer = this[_contextStorage].get(contextID);

        const context = getContext(contextContainer, _context)();
        contextContainer.clear();
        this[_contextStorage].delete(contextID);
        return context;
    }

    [_getContext](contextID) {
        const context = this[_contextStorage]
            .get(contextID);
        return context || setContextStorage(this[_contextStorage], contextID);
    }

    [_create](job, parent) {
        this[_setParent](parent);
        this[_stream].set(_instance, toFunction(job));
        return this;
    }

    [_addParent](parent) {
        this[_refs].get(_topParent)
            .getOrElse((parent) => {
                parent[_setChildren](this);
                this[_setParent](parent);
            })(parent);
        return this;
    };

    [_setParent](parent) {
        if (isStream(parent)) {
            this[_refs].set(_parent, (..._) => parent[_triggerUp](..._));
            this[_refs].set(_topRef, (..._) => parent[_getTopRef](..._));
            this[_refs].set(_topParent, (..._) => parent[_addParent](..._));
        }
    }

    [_setChildren](child) {
        if (isStream(child)) {
            this[_refs].set(_child, (..._) => child[_run](..._));
            this[_refs].set(_bottomRef, (..._) => child[_getBottomRef](..._));
        }

    };


    [_triggerUp](data, type, contextID) {
        this[_refs]
            .get(_parent)
            .getOrElse((data, type) => this[_run](isEmptyData(data) ? TOP_INSTANCE : data, type, contextID))(data, type, contextID);

    };


    [_copyJob](parent) {
        const job = stream(null, parent);
        job[_setStream](this[_stream]);

        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_setStream](handlers) {
        this[_stream] = handlers.copy();
    };


    [_getTopRef](uuid) {
        return this[_refs].get(_topRef)
            .getOrElse((uuid) => this[_copy](uuid))(uuid);
    };


    [_getBottomRef](uuid, parent, goNext = false) {
        const copyJob = goNext ? parent : this[_copyJob](parent);
        const next = goNext || this[_uuid] === uuid;
        return this[_refs]
            .get(_bottomRef)
            .getOrElse((uuid, job) => job)(uuid, copyJob, next);
    }

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };

    [_triggerDown](data, type, contextID) {
        this[_refs]
            .get(_child)
            .getOrElse((data, type) => option()
                .or(isStop(data, type), () => {
                    this[_onStreamFinishHandlers].once(contextID).getOrElse(emptyFn)(data);
                })
                .or(isError(data, type), () => {
                    this[_onStreamErrorHandlers].once(contextID).getOrElse(emptyFn)(data);
                })
                .finally(() => this[_triggerUp](EMPTY_DATA, type, contextID)))(data, type, contextID);


    };

    [_run](data, type, contextID) {
        option()
            .or(isError(data, type), () => this[_error](data, type, contextID))
            .or(isStop(data, type), () => this[_stop](data, type, contextID))
            .or(stopNoData(data, type), () => this[_stopStep](data, type, contextID))
            .finally(() => this[_executeStep](data, type, contextID));
    }

    [_executeStep](data, type, contextID) {
        setPromise(this[_stream], this[_getContext](contextID))(data, type)
            .then((_) => this[_triggerDown](_, type, contextID))
            .catch((_) => this[_error](_, type, contextID));


    };

    async [_stop](data, type, contextID) {
        const sessionContext = this[_getContext](contextID);
        const instance = await Promise.resolve(getContext(sessionContext, _root)());
        const context = this[_clearContext](contextID);

        this[_stream]
            .get(_onStop)
            .getOrElse((inst, _) => Promise.resolve(_))(instance, context)
            .then((_) => this[_triggerDown](_, STOP_TYPE, contextID));


    }

    [_stopStep](data, type, contextID) {
        this[_triggerUp](data, STOP_TYPE, contextID);
    }

    [_error](error, type, contextID) {
        const onError = this[_stream].get(_onError);
        const sessionContext = this[_getContext](contextID);
        const root = getContext(sessionContext, _root)();
        const context = this[_clearContext](contextID);
        return onError
            .getOrElse(() => Promise.reject(error))(root, context, error)
            .catch((error) => this[_triggerDown](error, ERROR_TYPE, contextID))
        // .then((_) => this[_triggerDown](_, type, contextID));
    }

    [_onStreamFinish](cb, contextID) {
        this[_onStreamFinishHandlers].set(contextID, cb);
    };

    [_onStreamError](cb, contextID) {
        this[_onStreamErrorHandlers].set(contextID, cb);

    }

    // return copy of stream instance
    copy() {
        return this[_getTopRef](this[_uuid]);
    };

    // return new stream instance
    map(fn) {
        const job = stream(fn, this);
        this[_setChildren](job);
        return job;
    };

    // return new stream instance
    flatMap(fn) {
    };

    // return new stream instance
    through(joined) {
        return joined
            .copy()
            [_addParent](this)
            .map(_ => _);
    };

    throughTask(_task) {
        return this.map(_ => task(_).through(_task).unsafeRun())
    };

    //OPTIONAL: onReady Means, taking initialisation object, and return promise with new params.
    // return same instance

    onReady(cb) {
        this[_stream].set(_onReady, cb);
        return this;

    };

    // OPTIONAL: event to pause, for example filereader, or web socket
    // return same instance
    onPause(cb) {
        this[_stream].set(_onPause, toPromise(cb));
        return this;

    };

    //OPTIONAL: event to resume stream.
    // return same instance
    onResume(cb) {
        this[_stream].set(_onResume, toPromise(cb));
        return this;
    };

    //OPTIONAL: In case need to destroy instance
    // return same instance
    onStop(cb) {
        this[_stream].set(_onStop, toPromise(cb));
        return this;
    };

    // OPTIONAL: every time data collected
    // Will return, chunk, and scope context. In case you need to manage own history.
    // return same instance
    onData(cb) {
        this[_stream].set(_onData, cb);
        return this;
    };

    // OPTIONAL: handling error.
    // return same instance
    onError(cb) {
        this[_stream].set(_onError, toPromise(cb));
        return this;

    }

    // boolean, if straem instance or not
    isStream() {
        return this.toString() === '[object Stream]';
    };


    //Infinite stream, skip error/ continue.
    //    @param errors, how many error retries, till fail.
    unsafeRun(errors) {
        return {
            stop() {

            },
            pause() {

            },
            resume() {

            }
        }
    };

    //Infinite stream, auto stop on error.
    safeRun() {
        return {
            stop() {

            },
            pause() {

            },
            resume() {

            }
        }
    }


    // Runs stream till return null. Will return Promise with instance context
    run() {
        //return Promise.
        return new Promise((resolve, reject) => {

            const contextID = Symbol('_contextID');


            this[_onStreamFinish]((data) => resolve(data), contextID);
            this[_onStreamError]((error) => reject(error), contextID);

            this[_triggerUp](EMPTY_DATA, RUN_TYPE, contextID);
        });
    }


    toString() {
        return '[object Stream]'
    };

    static empty() {
        return stream();
    };
}

const stream = (...args) => new Stream(...args);

const image = document.getElementById('target');

const closure = (a, b) => () => {
    let instance;
    const c = a((_) => {
        instance = b(_);
    });
    return instance(c)
};

const setController = (controller) => (_) => ({
    push(value) {
        controller.enqueue(value);
        return _;
    },
    close() {
        controller.close();
        return _
    }
});

const setReadableStream = (cb) => new ReadableStream({
    start(controller) {
        cb(controller);
    }
});

const controllerInstance = closure(setReadableStream, setController);

const readerStream = (rs) => stream(() => rs.getReader())
    .onReady(async reader => {
        const {done, value} = await reader.read();
        return done ? null : value;
    })
    .onStop(reader => {
        reader.releaseLock();
    });

const writeStream = stream(() => controllerInstance())
    .onReady((controller, context) => controller.push(context))
    .onStop((controller) => controller.close());



const customStream = (rs) => readerStream(rs)
    .through(writeStream)
    .run();

task({uri: './tortoise.png'})
    .map(({uri}) => fetch(uri))
    .map(({body}) => body)
    .map((rs) => customStream(rs))
    // Create a new response out of the stream
    .map(rs => new Response(rs))
    // Create an object URL for the response
    .map(response => response.blob())
    .map(blob => URL.createObjectURL(blob))
    // Update image
    .map(url => {
        image.src = url;
    })
    .unsafeRun();

})));
