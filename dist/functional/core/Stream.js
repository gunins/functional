(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('./Option.js'), require('./Task.js'), require('./List.js')) :
	typeof define === 'function' && define.amd ? define(['exports', './Option.js', './Task.js', './List.js'], factory) :
	(factory((global['functional/core/Stream'] = global['functional/core/Stream'] || {}, global['functional/core/Stream'].js = {}),global.Option_js,global.Task_js,global.List_js));
}(this, (function (exports,Option_js,Task_js,List_js) { 'use strict';

const isStream = ({isStream} = {}) => isStream && isStream();

const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);
const toFunction = (job) => isFunction(job) ? job : (_, resolve) => resolve(job);
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
const _setParent = Symbol('_setParent');
const _addParent = Symbol('_addParent');
const _setChildren = Symbol('_setChildren');
const _triggerUp = Symbol('_triggerUp');
const _copyJob = Symbol('_copyJob');
const _getTopRef = Symbol('_getTopRef');
const _getBottomRef = Symbol('_getBottomRef');
const _copy = Symbol('_copy');

class Stream {
    // job will return stream instance. In case onReady not defined, shortcut for.map method.
    // for non stream instances better to use tasks.
    constructor(job, parent) {
        this[_parent] = Option_js.none();
        this[_topRef] = Option_js.none();
        this[_topParent] = Option_js.none();
        this[_children] = List_js.List.empty();
        this[_resolvers] = List_js.List.empty();
        this[_rejecters] = List_js.List.empty();
        this[_resolve] = Option_js.none();
        this[_reject] = Option_js.none();
        this[_bottomRef] = Option_js.none();
        this[_uuid] = Symbol('uuid');
        this[_create](job, parent);
    }

    [_create](job, parent) {
        this[_setParent](parent);
        this[_stream] = job !== undefined ? Option_js.some(toFunction(job)) : Option_js.none();
        return this;
    }

    [_setParent](parent) {
        if (isStream(parent)) {
            this[_parent] = Option_js.some(parent[_triggerUp].bind(parent));
            this[_topRef] = Option_js.some(parent[_getTopRef].bind(parent));
            this[_topParent] = Option_js.some(parent[_addParent].bind(parent));
        }
    }
    [_triggerUp](){};




    [_copyJob](parent) {
        const job = stream(this[_stream].get(), parent);
        job[_resolvers] = this[_resolvers];
        job[_rejecters] = this[_rejecters];


        if (parent) {
            parent[_setChildren](job);
        }
        return job;
    };




    [_getTopRef](uuid) {
        return this[_topRef]
            .getOrElse((uuid) => this[_copy](uuid))(uuid);
    };

    [_getBottomRef](uuid, parent, goNext = false) {
        const copyJob = goNext ? parent : this[_copyJob](parent);
        const next = goNext || this[_uuid] === uuid;

        return this[_bottomRef].getOrElse((uuid, job) => job)(uuid, copyJob, next);
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


    };

    // OPTIONAL: event to pause, for example filereader, or web socket
    // return same instance
    onPause() {

    };

    //OPTIONAL: event to resume stream.
    // return same instance

    onResume() {

    };

    //OPTIONAL: In case need to destroy instance
    // return same instance
    onStop() {

    };

    // OPTIONAL: every time data collected
    // Will return, chunk, and scope context. In case you need to manage own history.
    // return same instance
    onData(fn) {
    };

    // OPTIONAL: handling error.
    // return same instance
    onError(fn) {

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
