(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Stream.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Stream.js'], factory) :
	(factory((global['functional/nodeStreams/nodeStreams'] = global['functional/nodeStreams/nodeStreams'] || {}, global['functional/nodeStreams/nodeStreams'].js = {}),global.Stream_js));
}(this, (function (exports,Stream_js) { 'use strict';

const {assign} = Object;
const readPromise = (stream$$1) => new Promise((resolve) => stream$$1.on('readable', () => resolve(stream$$1)));

const writePromise = async (stream$$1) => {
    return ({
        write(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream$$1.write(chunk, encoding, () => resolve(chunk)))
        },
        end(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream$$1.end(chunk, encoding, (..._) => resolve(chunk)))
        },
        finished(chunk) {
            return new Promise((resolve) => stream$$1.finished(chunk, () => resolve(chunk)))
        },
        destroy() {
            return Promise.resolve(stream$$1.destroy())
        },
        push(chunk) {
            return Promise.resolve(stream$$1.push(chunk));

        },
        on(name, cb) {
            return stream$$1.on(name, (..._) => cb(..._))
        },
        once(name) {
            return new Promise((resolve) => stream$$1.once(name, (_) => resolve(_)))
        },
        readLast() {
            return new Promise((resolve) => {
                let chunks = Buffer.alloc(0);
                stream$$1.on('data', (_) => {
                    chunks = Buffer.concat([chunks, _]);
                });
                stream$$1.on('end', () => resolve(chunks));
                stream$$1.end();
            })
        },
        close() {
            return Promise.resolve(stream$$1.close())
        },
        resume() {
            return Promise.resolve(stream$$1.resume())
        }
    });
};

const duplexPromise = (stream$$1) => {
    return writePromise(stream$$1)
        .then((writer) => {
            return assign({
                read(...args) {
                    return Promise.resolve(stream$$1.read(...args))

                }
            }, writer)
        });
};


const readStream = (instance, ...args) => {
    return Stream_js.stream(() => readPromise(instance))
        .onReady((instance) => instance.read(...args))
        .onStop((instance) => instance.destroy());
};

const writeStream = (instance) => Stream_js.stream(() => writePromise(instance))
    .onReady((instance, chunk) => instance.write(chunk))
    .onStop((instance, context, data) => instance.end(data));

const duplexStream = (instance) => Stream_js.stream(() => duplexPromise(instance))
    .onReady((instance, context) => instance.write(context))
    .onData((chunk, context, instance) => instance.read())
    .onStop((instance, context) => instance.readLast());

exports.writeStream = writeStream;
exports.readStream = readStream;
exports.duplexStream = duplexStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
