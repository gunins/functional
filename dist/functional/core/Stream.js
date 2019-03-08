(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js'), require('./Task.js'), require('./List.js'), require('../utils/clone.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js', './Task.js', './List.js', '../utils/clone.js'], factory) :
	(factory((global['functional/core/Stream'] = global['functional/core/Stream'] || {}, global['functional/core/Stream'].js = {}),global.Option_js,global.Task_js,global.List_js,global.clone_js));
}(this, (function (exports,Option_js,Task_js,List_js,clone_js) { 'use strict';

const isStream = ({isStream} = {}) => isStream && isStream();
const isOption = ({isOption} = {}) => isOption && isOption();

const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
const toFunction = (job) => isFunction(job) ? job : () => job;

const storage = () => {
    const store = new Map();
    return {
        get(key) {
            return store.get(key) || Option_js.none()
        },
        set(key, value) {
            const data = isOption(value) ? value : Option_js.some(value);
            store.set(key, data);
            return data;
        }
    }
};

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
const _stream = Symbol('_stream');
const _setParent = Symbol('_setParent');
const _addParent = Symbol('_addParent');
const _setChildren = Symbol('_setChildren');
const _triggerUp = Symbol('_triggerUp');
const _run = Symbol('_run');
const _copyJob = Symbol('_copyJob');
const _getTopRef = Symbol('_getTopRef');
const _getBottomRef = Symbol('_getBottomRef');
const _copy = Symbol('_copy');


const _refs = Symbol('_refs');
const _handlers = Symbol('_handlers');
const _setHandlers = Symbol('_setHandlers');

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
        this[_setHandlers](storage());

        this[_children] = List_js.List.empty();


        this[_create](job, parent);
    }

    [_create](job, parent) {
        this[_setParent](parent);
        this[_stream] = job !== undefined ? Option_js.some(toFunction(job)) : Option_js.none();
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

    [_triggerUp]() {
        return this[_refs].get(_parent).getOrElse(() => this[_run]())();

    };


    [_copyJob](parent) {
        const job = stream(this[_stream].get(), parent);
        job[_setHandlers](this[_handlers]);

        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };

    [_setHandlers](handlers) {
        this[_handlers] = handlers;
    };


    [_getTopRef](uuid) {
        return this[_topRef]
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


    // return copy of stream instance
    copy() {
        return this[_getTopRef](this[_uuid]);
    };

    // return new stream instance
    map(fn) {
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

exports.Stream = Stream;
exports.stream = stream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
