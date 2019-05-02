import {some} from './Maybe.mjs';
import {task} from './Task.mjs';
import {option} from '../utils/option.mjs';
import {storage} from '../utils/storage.mjs';

//stream lifecycle types
const RUN_TYPE = Symbol('RUN_TYPE');
const SAFE_RUN_TYPE = Symbol('SAFE_RUN_TYPE');
const UNSAFE_RUN_TYPE = Symbol('UNSAFE_RUN_TYPE');
const PAUSE_TYPE = Symbol('PAUSE_TYPE');
const RESUME_TYPE = Symbol('RESUME_TYPE');
const STOP_TYPE = Symbol('STOP_TYPE');
const ERROR_TYPE = Symbol('ERROR_TYPE');
const TOP_INSTANCE = Symbol('TOP_INSTANCE');
const EMPTY_DATA = Symbol('NO_DATA');

const isStream = (_ = {}) => _ && _.isStream && _.isStream();
const isDefined = (_) => _ !== undefined;
const isFunction = (obj) => !!(obj && obj.constructor && obj.call && obj.apply);

const toFunction = (job) => option()
    .or(isFunction(job), () => some(job))
    .or(isDefined(job), () => some(() => job))
    .finally(() => some(_ => _));

const emptyFn = _ => _;


const getRoot = (instance, onReady) => option()
    .or(onReady.isSome(), () => instance.get()())
    .finally(() => instance.get());


const applyStep = cb => async _ => {
    try {
        cb(await _);
        return _;
    } catch (error) {
        return error;
    }
};

const getContext = (context, field) => () => context.getValue(field);
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
        .then((root) => Promise.resolve(onReady.getOrElse(() => root(data))(root, data))
            .then((_) => setStreamContext(
                onData
                    .getOrElse(emptyFn)(_, getStreamContext(), root))
            ));


};


const topInstance = (data, type) => data === TOP_INSTANCE;
const noData = (data, type) => !data;
const isEmptyData = (data) => data === null;
const isError = (data, type) => type === ERROR_TYPE;
const isStop = (data, type) => type === STOP_TYPE;
const isPause = (data, type) => type === PAUSE_TYPE;
const isResume = (data, type) => type === RESUME_TYPE;
const isRun = (data, type) => type === RUN_TYPE;
const isSafeRun = (data, type) => type === SAFE_RUN_TYPE;
const isUnsafeRun = (data, type) => type === UNSAFE_RUN_TYPE;
const anyRunType = (data, type) => isRun(data, type) || isSafeRun(data, type) || isUnsafeRun(data, type);
const stopNoData = (data, type) => !topInstance(data, type) && noData(data, type) && isRun(data, type);


/**
 * Stream is executing asynchronusly.
 * */

//Define Private methods
const _parent = Symbol('_parent');
const _upParent = Symbol('_upParent');
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
const _stepUp = Symbol('_stepUp');
const _stop = Symbol('_stop');
const _triggerUp = Symbol('_triggerUp');
const _stepDown = Symbol('_stepDown');
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

/*let uuuID = 0;
const uuid = () => uuuID++;*/

const setContextStorage = (context, contextID) => context
    .get(contextID)
    .getOrElseLazy(() => context.set(contextID, storage())
        .get());


class Stream {
    // job will return stream instance. In case onReady not defined, shortcut for.map method.
    // for non stream instances better to use tasks.

    constructor(job, parent) {
        this[_uuid] = Symbol('uuid');
        this[_refs] = storage();
        this[_stream] = storage();
        this[_contextStorage] = storage();
        this[_onStreamFinishHandlers] = storage();
        this[_onStreamErrorHandlers] = storage();
        this[_create](job, parent);
    }

    [_clearContext](contextID) {
        const contextContainer = this[_contextStorage].getValue(contextID);

        const context = getContext(contextContainer, _context)();
        contextContainer.clear();
        this[_contextStorage].delete(contextID);
        return context;
    }

    [_getContext](contextID) {
        return setContextStorage(this[_contextStorage], contextID);
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
            this[_refs].set(_upParent, (..._) => parent[_run](..._));
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

    [_stepDown](data, type, contextID) {
        this[_refs]
            .get(_child)
            .getOrElse(
                (data, type) => option()
                    .or(isStop(data, type), () => {
                        const context = this[_clearContext](contextID);
                        this[_onStreamFinishHandlers]
                            .once(contextID)
                            .getOrElse(emptyFn)(context);
                    })
                    .or(isError(data, type), () => {
                        this[_onStreamErrorHandlers]
                            .once(contextID)
                            .getOrElse(emptyFn)(data);
                    })
                    .finally(() => this[_stepUp](null, type, contextID))
            )(data, type, contextID);


    };

    [_run](data, type, contextID) {
        option()
            .or(isError(data, type), () => this[_error](data, type, contextID))
            .or(isStop(data, type), () => this[_stop](data, type, contextID))
            .or(noData(data, type) && !isStop(data, type), () => this[_stepUp](data, type, contextID))
            .finally(() => this[_executeStep](data, type, contextID));
    }

    [_executeStep](data, type, contextID) {
        setPromise(this[_stream], this[_getContext](contextID))(data, type)
            .then(
                (_) => option()
                    .or(topInstance(data, type) && noData(_, type), () => this[_stop](_, type, contextID))
                    .finally(() => this[_stepDown](_, type, contextID))
            ).catch((_) => this[_triggerUp](_, ERROR_TYPE, contextID));
    };

    [_stop](data, type, contextID) {
        const sessionContext = this[_getContext](contextID);
        const instance = getContext(sessionContext, _root)();
        const context = getContext(sessionContext, _context);

        this[_stream]
            .get(_onStop)
            .getOrElse(() => Promise.resolve(data))(instance, context, data)
            .then((_) => this[_stepDown](_, STOP_TYPE, contextID))


    }

    [_stepUp](data, type, contextID) {
        this[_refs]
            .get(_upParent)
            .getOrElse(() => this[_run](TOP_INSTANCE, type, contextID))(data, type, contextID)

    }

    [_error](error, type, contextID) {
        const onError = this[_stream].get(_onError);
        const sessionContext = this[_getContext](contextID);
        const root = getContext(sessionContext, _root)();
        const context = this[_clearContext](contextID);
        return onError
            .getOrElse(() => Promise.reject(error))(root, context, error)
            .catch((error) => this[_stepDown](error, ERROR_TYPE, contextID))
    }

    [_onStreamFinish](cb, contextID) {
        this[_onStreamFinishHandlers].set(contextID, cb);
    };

    [_onStreamError](cb, contextID) {
        this[_onStreamErrorHandlers].set(contextID, cb);

    }
    //
    // return copy of new stream instance
    copy() {
        return this[_getTopRef](this[_uuid]);
    };
    // will take a functor (chunk)=>Promise
    // return new stream instance
    map(fn) {
        const job = stream(fn, this);
        this[_setChildren](job);
        return job;
    };

   /* // return new stream instance
    flatMap(fn) {
    };*/
    //Will take a stream, and add to tail
    // return new stream instance
    through(joined) {
        return joined
            .copy()
            [_addParent](this)
            .map(_ => _);
    };
    // Will take a task
    throughTask(_task) {
        return this.map(_ => task(_).through(_task).unsafeRun())
    };

    //OPTIONAL: onReady Means, taking initialisation object, and return promise with new params.
    // callback will take arguments (instance, data)=>Promise
    // return same instance

    onReady(cb) {
        this[_stream].set(_onReady, cb);
        return this;

    };

   /* // OPTIONAL: event to pause, for example filereader, or web socket
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
    };*/

    //OPTIONAL: In case need to destroy instance
    // callback will take arguments (instance, context, data)=>Promise
    // return same instance
    onStop(callback) {
        this[_stream].set(_onStop, toPromise(callback));
        return this;
    };

    // OPTIONAL: every time data collected
    // Will return, chunk, and scope context. In case you need to manage own history.
    // callback will take arguments (data, context, instance)=>Promise
    // return same instance
    onData(callback) {
        this[_stream].set(_onData, callback);
        return this;
    };

    // OPTIONAL: handling error.
    // return same instance
    // callback will take arguments (instance, context, error)=>Promise
    onError(callback) {
        this[_stream].set(_onError, toPromise(callback));
        return this;

    }

    // boolean, if stream instance or not
    isStream() {
        return this.toString() === '[object Stream]';
    };


    //Infinite stream, skip error/ continue.
    //    @param errors, how many error retries, till fail.
    /*unsafeRun(errors) {
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
    }*/


    // Runs stream till return null. Will return Promise with instance context
    run() {
        //return Promise.
        return new Promise((resolve, reject) => {

            const contextID = Symbol('_contextID');

            this[_onStreamFinish]((data) => resolve(data), contextID);
            this[_onStreamError]((error) => reject(error), contextID);

            this[_triggerUp](null, RUN_TYPE, contextID);
        })
    }


    toString() {
        return '[object Stream]'
    };
    //Returns Empty Stream
    static empty() {
        return stream();
    };
}

const stream = (...args) => new Stream(...args);

export {Stream, stream}
