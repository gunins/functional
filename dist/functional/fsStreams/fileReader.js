(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fs'), require('../core/Stream.js')) :
	typeof define === 'function' && define.amd ? define(['exports', 'fs', '../core/Stream.js'], factory) :
	(factory((global['functional/fsStreams/fileReader'] = global['functional/fsStreams/fileReader'] || {}, global['functional/fsStreams/fileReader'].js = {}),global.fs,global.Stream_js));
}(this, (function (exports,fs,Stream_js) { 'use strict';

const fileReadPromise = (src) => new Promise((resolve) => {
    const stream$$1 = fs.createReadStream(src);
    stream$$1.on('readable', () => resolve(stream$$1));
});
const fileWritePromise = async (src) => {
    const stream$$1 = fs.createWriteStream(src);
    return {
        write(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream$$1.write(chunk, encoding, () => resolve(chunk)))
        },
        end(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream$$1.end(chunk, encoding, () => resolve(chunk)))
        }
    }

};

const fileReadStream = (src, size = 10) => Stream_js.stream(() => fileReadPromise(src))
    .onReady((instance) => instance.read(size))
    .onStop((instance) => instance.destroy());

const fileWriteStream = (src, encoding = 'utf8') => Stream_js.stream(() => fileWritePromise(src, encoding))
    .onReady((instance, chunk) => instance.write(chunk))
    .onStop((instance) => instance.end());

exports.fileReadStream = fileReadStream;
exports.fileWriteStream = fileWriteStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
