(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js'), require('./Task.js'), require('./List.js'), require('../utils/clone.js'), require('../utils/option.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js', './Task.js', './List.js', '../utils/clone.js', '../utils/option.js'], factory) :
	(factory((global['functional/core/Stream'] = global['functional/core/Stream'] || {}, global['functional/core/Stream'].js = {}),global.Option_js,global.Task_js,global.List_js,global.clone_js,global.option_js));
}(this, (function (exports,Option_js,Task_js,List_js,clone_js,option_js) { 'use strict';

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
const toFunction = (job) => option_js.option()
    .or(isFunction(job), () => Option_js.some(job))
    .or(isDefined(job), () => Option_js.some(() => job))
    .finally(() => Option_js.none());

const emptyFn = _ => _;

const toMaybe = (value) => option_js.option()
    .or(isMaybe(value), () => value)
    .or(!isDefined(value), () => Option_js.none())
    .finally(() => Option_js.some(value));

const storage = (copy) => {
    const store = new Map(copy);
    return {
        get(key) {
            return store.get(key) || Option_js.none()
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
            const context = store.get(key) || Option_js.none();
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

const getRoot = (instance, onReady) => option_js.option()
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
            .getOrElse((data, type) => option_js.option()
                .or(isStop(data, type), () => {
                    this[_onStreamFinishHandlers].once(contextID).getOrElse(emptyFn)(data);
                })
                .or(isError(data, type), () => {
                    this[_onStreamErrorHandlers].once(contextID).getOrElse(emptyFn)(data);
                })
                .finally(() => this[_triggerUp](EMPTY_DATA, type, contextID)))(data, type, contextID);


    };

    [_run](data, type, contextID) {
        option_js.option()
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
            .getOrElse((_) => Promise.resolve(_))(context, instance)
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
        return this.map(_ => Task_js.task(_).through(_task).unsafeRun())
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

exports.Stream = Stream;
exports.stream = stream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
