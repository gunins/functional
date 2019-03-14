import {some, none} from './Option';
import {task} from './Task';
import {List} from './List';
import {clone} from '../utils/clone';
import {option} from '../utils/option';

const RUN_TYPE = 'run';
const SAFE_RUN_TYPE = 'safeRun';
const UNSAFE_RUN_TYPE = 'unsafeRun';

const isStream = (_ = {}) => _.isStream && _.isStream();
const isMaybe = (_ = {}) => _.isOption && _.isOption();
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

const storage = () => {
    const store = new Map();
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

        }
    }
};

const getRoot = (instance, onReady) => option()
    .or(onReady, () => instance())
    .finally(() => instance);


const applyStep = cb => _ => {
    cb(_);
    return _;
};

const getContext = (context, field) => context.get(field).get();
const setContext = (context, field) => applyStep(_ => context.set(field, _));

const noData = (data, type) => !data && type === RUN_TYPE;

const setPromise = (streamInstance, context) => (data, success, type) => {
    const instance = streamInstance.get(_instance);
    const onReady = streamInstance.get(_onReady);
    const onData = streamInstance.get(_onData);

    const rootContext = setContext(context, _root);
    const streamContext = setContext(context, _context);

    const root = context
        .get(_root)
        .getOrElseLazy(() => rootContext(getRoot(instance.get(), onReady.get())));

    return new Promise((resolve, reject) => success ? resolve(root) : reject(data))
        .then((root) => onReady.getOrElse(() => root(data))(root, data))
        .then((data) => option()
            .or(noData(data, type), () => data)
            .finally(() => streamContext(
                onData
                    .getOrElse(emptyFn)(data, getContext(context, _context))))
        )

};

const repeat = (method, stop) => method()
    .then((data) => option()
        .or(data, () => method())
        .finally(() => stop()));

/**
 * Stream is executing asynchronusly.
 * */

//Define Private methods
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
const _setPromise = Symbol('_setPromise');
const _setParent = Symbol('_setParent');
const _addParent = Symbol('_addParent');
const _setChildren = Symbol('_setChildren');
const _successRun = Symbol('_successRun');
const _failRun = Symbol('_failRun');
const _stop = Symbol('_stop');
const _trigger = Symbol('_trigger');
const _triggerUp = Symbol('_triggerUp');
const _triggerDown = Symbol('_triggerDown');
const _run = Symbol('_run');
const _map = Symbol('_map');
const _flatMap = Symbol('_flatMap');
const _copyJob = Symbol('_copyJob');
const _getTopRef = Symbol('_getTopRef');
const _getBottomRef = Symbol('_getBottomRef');
const _copy = Symbol('_copy');


const _refs = Symbol('_refs');
const _stream = Symbol('_stream');
const _setStream = Symbol('_setStream');

const _root = Symbol('_root');
const _context = Symbol('_context');

const _instance = Symbol('_instance');
const _onReady = Symbol('_onReady');
const _onPause = Symbol('_onPause');
const _onResume = Symbol('_onResume');
const _onStop = Symbol('_onStop');
const _onData = Symbol('_onData');
const _onError = Symbol('_onError');

class Stream {
    // job will return stream instance. In case onReady not defined, shortcut for.map method.
    // for non stream instances better to use tasks.
    constructor(job, parent) {
        this[_uuid] = Symbol('uuid');
        this[_refs] = storage();
        this[_context] = storage();
        this[_setStream](storage());

        this[_children] = List.empty();


        this[_create](job, parent);
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

    [_setChildren](children) {
        if (isStream(children)) {
            this[_children] = this[_children].insert((..._) => children[_run](..._));
            this[_refs].set(_bottomRef, (..._) => children[_getBottomRef](..._));
        }

    };

    [_trigger](_) {
        return this[_refs]
            .get(_parent)
            .getOrElse((_) => this[_run](null, true, _))(_)
    }

    [_stop](_) {
        return this[_refs]
            .get(_parent)
            .getOrElse((_) => this[_run](null, false, _))(_)
    }

    [_triggerUp](_) {
        return repeat(() => this[_trigger](_), () => this[_stop](_))
            .then(() => this[_context]
                .get(_context)
                .get())

    };

    [_successRun](data, type) {
        this[_triggerDown](data, true, type);
        return data;
    };

    [_copyJob](parent) {
        const job = stream(this[_stream].get(), parent);
        job[_setStream](this[_stream]);

        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_setStream](handlers) {
        this[_stream] = handlers
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

    [_triggerDown](data, resolve, type) {
        this[_children].map(child => child(data, resolve, type));
    };

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };

    [_run](data, success = true, type) {
        return setPromise(this[_stream], this[_context])(data, success, type)
            .then((data) => this[_successRun](data, type))
            .catch((_) => {
              //  console.log('run', _);
                //this[_failRun](_)
            });
    };

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
            [_addParent](this);
    };

    throughTask(_task) {
        return this.map(_=>task(_).through(_task).unsafeRun())
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
        this[_stream].set(_onPause, cb);
        return this;

    };

    //OPTIONAL: event to resume stream.
    // return same instance
    onResume(cb) {
        this[_stream].set(_onResume, cb);
        return this;
    };

    //OPTIONAL: In case need to destroy instance
    // return same instance
    onStop(cb) {
        this[_stream].set(_onStop, cb);
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
        this[_stream].set(_onError, cb);
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
        return this[_triggerUp](RUN_TYPE);
    }


    toString() {
        return '[object Stream]'
    };

    static empty() {
        return stream();
    };
}

let stream = (...args) => new Stream(...args);

export {Stream, stream}
