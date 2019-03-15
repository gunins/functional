(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js'), require('./Task.js'), require('./List.js'), require('../utils/clone.js'), require('../utils/option.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js', './Task.js', './List.js', '../utils/clone.js', '../utils/option.js'], factory) :
	(factory((global['functional/core/Stream'] = global['functional/core/Stream'] || {}, global['functional/core/Stream'].js = {}),global.Option_js,global.Task_js,global.List_js,global.clone_js,global.option_js));
}(this, (function (exports,Option_js,Task_js,List_js,clone_js,option_js) { 'use strict';

//stream lifecycle types
const RUN_TYPE = Symbol('RUN_TYPE');
const isStream = (_ = {}) => _.isStream && _.isStream();
const isMaybe = (_ = {}) => _.isOption && _.isOption();
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

const storage = () => {
    const store = new Map();
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
        clear() {
            store.clear();
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

const noData = (data, type) => !data && type === RUN_TYPE;

const setPromise = (streamInstance, context) => (data, type) => {
    const instance = streamInstance.get(_instance);
    const onReady = streamInstance.get(_onReady);
    const onData = streamInstance.get(_onData);
    const onError = streamInstance.get(_onError);

    const rootContext = setContext(context, _root);
    const setStreamContext = setContext(context, _context);
    const getStreamContext = getContext(context, _context);

    const root = context
        .get(_root)
        .getOrElseLazy(() => rootContext(getRoot(instance, onReady)));

    return new Promise((resolve) => resolve(root))
        .then((root) => onReady.getOrElse(() => root(data))(root, data))
        .then((data) => option_js.option()
            .or(noData(data, type), () => data)
            .finally(() => setStreamContext(
                onData
                    .getOrElse(emptyFn)(data, getStreamContext())))
        )
        .catch((error) => onError
            .getOrElse(() => Promise.reject(error))(error));

};
const repeat = (method, stop) => method()
    .then((data) => option_js.option()
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
const _bottomRef = Symbol('_bottomRef');
const _uuid = Symbol('_uuid');
const _create = Symbol('_create');
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

        this[_children] = List_js.List.empty();


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

    [_setChildren](child) {
        if (isStream(child)) {
            this[_children] = this[_children].insert((..._) => child[_run](..._));
            this[_refs].set(_bottomRef, (..._) => child[_getBottomRef](..._));
        }

    };

    [_trigger](_) {
        return this[_refs]
            .get(_parent)
            .getOrElse((_) => this[_run](null, _))(_)
    }

    [_stop](_) {
        console.log('Stop', _);

        /*  const context = getContext(this[_context], _context);

          return this[_refs]
              .get(_parent)
              .getOrElse((_) => this[_run](null, _))(_)
              .then(() => {
                  const _ = context();
                  this[_context].clear();
                  return _;
              });*/
    }

    [_triggerUp](_) {
        const context = getContext(this[_context], _context);
        return repeat(() => this[_trigger](_)).then(() => context());

    };

    [_successRun](data, type) {
        return this[_triggerDown](data, type);
        // return data;
    };

    [_failRun](_) {
        return Promise.reject(_);
    }

    [_copyJob](parent) {
        const job = stream(null, parent);
        job[_setStream](this[_stream]);

        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_setStream](handlers) {
        this[_stream] = handlers;
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

    [_triggerDown](data, type) {
        const values = this[_children].map(child => child(data, type)).toArray();
        return Promise.all(values);
    };

    [_copy](uuid) {
        return this[_getBottomRef](uuid);
    };

    [_run](data, type) {
        return setPromise(this[_stream], this[_context])(data, type)
            .then((data) => this[_successRun](data, type))
            .catch((_) => this[_failRun](_));
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

exports.Stream = Stream;
exports.stream = stream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
