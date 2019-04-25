(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Stream'), require('../utils/option')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Stream', '../utils/option'], factory) :
	(factory((global['functional/nodeStreams/nodeStreams'] = global['functional/nodeStreams/nodeStreams'] || {}, global['functional/nodeStreams/nodeStreams'].js = {}),global.Stream,global.option));
}(this, (function (exports,Stream,option) { 'use strict';

const {assign} = Object;

const FINISHED = Symbol('FINISHED');

const isNull = (_) => _ === null;
const isFinished = (finish) => finish === FINISHED;

const pause = (timeout = 10) => new Promise((resolve) => setTimeout(() => resolve(), timeout));

const reader = (stream$$1) => {
    let finish = null;
    stream$$1.once('end', () => {
        finish = FINISHED;
    });
    return (size) => new Promise((resolve) => {
        const endEvent = () => resolve(stream$$1.read(size));
        const chunk = stream$$1.read(size);

        option.option()
            .or(isFinished(finish), () => resolve(null))
            .or(isNull(chunk), () => stream$$1
                .once('end', endEvent)
                .once('readable', async () => {
                    //hack for readable event, hoopefully node js will fix on V12
                    await pause(0);
                    stream$$1.removeListener('end', endEvent);
                    stream$$1.pause();
                    const chunk = stream$$1.read(size);
                    resolve(chunk);
                })
            )
            .finally(() => resolve(chunk));
    });
};

const readPromise = async (stream$$1, {size} = {}) => {
    const read = reader(stream$$1);
    return {
        async read() {
            const reader = await read(size);
            return reader;
        },
        async destroy() {
            stream$$1.destroy();
            return null;
        }
    }
};

const writePromise = async (stream$$1, {encoding} = {encoding: 'utf8'}) => {
    return ({
        write(chunk) {
            return new Promise((resolve) => stream$$1.write(chunk, encoding, () => resolve(chunk)))
        },
        end(chunk) {
            return new Promise((resolve) => stream$$1.end(chunk, encoding, () => resolve(chunk)))
        },
        finished(chunk) {
            return new Promise((resolve) => stream$$1.finished(chunk, () => resolve(chunk)))
        },
        async destroy() {
            stream$$1.destroy();
            return null;
        },
        on(name, cb) {
            return stream$$1.on(name, (..._) => cb(..._))
        },
        once(name) {
            return new Promise((resolve) => stream$$1.once(name, (_) => resolve(_)))
        },
        readLast(chunk) {
            return new Promise((resolve, reject) => {
                let chunks = Buffer.alloc(0);
                stream$$1.on('data', (_) => {
                    chunks = Buffer.concat([chunks, _]);
                });
                stream$$1.on('end', () => {
                    stream$$1.destroy();
                    resolve(chunks);
                });
                stream$$1.on('error', (error) => reject(error));
                stream$$1.end(chunk);
            })
        },
        async close() {
            return stream$$1.close();
        },
        async pause() {
            return stream$$1.pause();
        },
        async resume() {
            return stream$$1.resume();
        }
    });
};

const duplexPromise = (stream$$1, _ = {}) => {
    return writePromise(stream$$1, _)
        .then((writer) => {
            return assign({
                read() {
                    return Promise.resolve(stream$$1.read(_.size))

                }
            }, writer)
        });
};


const readStream = (instance, options) => Stream.stream(() => readPromise(instance, options))
    .onReady((instance) => instance.read())
    .onStop((instance) => instance.destroy())
    .onError((instance) => Promise.reject(instance.destroy()));

const writeStream = (instance) => Stream.stream(() => writePromise(instance))
    .onReady((instance, chunk) => instance.write(chunk))
    .onStop((instance, context, data) => instance.end(data))
    .onError((instance) => Promise.reject(instance.destroy()));


const duplexStream = (instance, options) => Stream.stream(() => duplexPromise(instance, options))
    .onReady((instance, context) => instance.write(context))
    .onData((chunk, context, instance) => instance.read())
    .onStop((instance, context, data) => instance.readLast(data))
    .onError((instance) => Promise.reject(instance.destroy()));

exports.writeStream = writeStream;
exports.readStream = readStream;
exports.duplexStream = duplexStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
