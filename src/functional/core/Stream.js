import {some, none} from './Option';
import {task} from './Task';
import {List} from './List';

const isStream = ({isStream} = {}) => isStream && isStream();
const isOption = ({isOption} = {}) => isOption && isOption();

const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
const toFunction = (job) => isFunction(job) ? job : (_, resolve) => resolve(job);

const storage = () => {
    const store = new Map();
    return {
        get(key) {
            return store.get(key) || none()
        },
        set(key, value) {
            const data = isOption(value) ? value : some(value);
            store.set(key, data);
            return data;
        }
    }
};

/**
 * Stream is executing asynchronusly, Tasks, with Lazy evaluation.
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
const _stream = Symbol('_stream');
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


const _handlers = Symbol('_handlers');
const _setHandlers = Symbol('_setHandlers');
const _getHandlers = Symbol('_getHandlers');

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
        this[_setHandlers](storage());

        this[_children] = List.empty();
        this[_resolvers] = List.empty();
        this[_rejecters] = List.empty();


        this[_create](job, parent);
    }

    [_create](job, parent) {
        this[_setParent](parent);
        this[_stream] = job !== undefined ? some(toFunction(job)) : none();
        return this;
    }

    [_setParent](parent) {
        if (isStream(parent)) {
            this[_handlers].set(_parent, (..._) => parent[_triggerUp](..._));
            this[_handlers].set(_topRef, (..._) => parent[_getTopRef](..._));
            this[_handlers].set(_topParent, (..._) => parent[_addParent](..._));
        }
    }

    [_triggerUp]() {
    };


    [_copyJob](parent) {
        const job = stream(this[_stream].get(), parent);
        job[_setHandlers](this[_getHandlers]);

        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_setHandlers](handlers) {
        this[_handlers] = handlers
    };

    [_getHandlers]() {
        return this[_handlers]
    };


    [_getTopRef](uuid) {
        return this[_topRef]
            .getOrElse((uuid) => this[_copy](uuid))(uuid);
    };

    [_getBottomRef](uuid, parent, goNext = false) {
        const copyJob = goNext ? parent : this[_copyJob](parent);
        const next = goNext || this[_uuid] === uuid;

        return this[_handlers].get(_bottomRef).getOrElse((uuid, job) => job)(uuid, copyJob, next);
    }

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };


    // return copy of stream instance
    copy() {
    };

    // return new stream instance
    map(fn) {
    };

    // return new stream instance
    flatMap(fn) {
    };

    // return new stream instance
    through(_stream) {
    };

    throughTask(_task) {
    };

    //OPTIONAL: onReady Means, taking initialisation object, and return promise with new params.
    // return same instance

    onReady(cb) {
        this[_handlers].set(_onReady, cb);
        return this;

    };

    // OPTIONAL: event to pause, for example filereader, or web socket
    // return same instance
    onPause(cb) {
        this[_handlers].set(_onPause, cb);
        return this;

    };

    //OPTIONAL: event to resume stream.
    // return same instance

    onResume(cb) {
        this[_handlers].set(_onResume, cb);
        return this;
    };

    //OPTIONAL: In case need to destroy instance
    // return same instance
    onStop(cb) {
        this[_handlers].set(_onStop, cb);
        return this;
    };

    // OPTIONAL: every time data collected
    // Will return, chunk, and scope context. In case you need to manage own history.
    // return same instance
    onData(cb) {
        this[_handlers].set(_onData, cb);
        return this;
    };

    // OPTIONAL: handling error.
    // return same instance
    onError(cb) {
        this[_handlers].set(_onError, cb);
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
