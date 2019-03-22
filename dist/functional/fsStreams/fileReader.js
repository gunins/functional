(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fs')) :
	typeof define === 'function' && define.amd ? define(['exports', 'fs'], factory) :
	(factory((global['functional/fsStreams/fileReader'] = global['functional/fsStreams/fileReader'] || {}, global['functional/fsStreams/fileReader'].js = {}),global.fs));
}(this, (function (exports,fs) { 'use strict';

const srcStream = (streamInstance) => (src) => new Promise((resolve) => {
    const stream = streamInstance(src);
    stream.on('readable', () => resolve(stream));
}).then((stream)=>stream);

const fileReaderStream = srcStream(fs.createReadStream);
const fileWriteStream = srcStream(fs.createWriteStream);

exports.fileReaderStream = fileReaderStream;
exports.fileWriteStream = fileWriteStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
