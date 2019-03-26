(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fs'), require('./nodeStreams.js')) :
	typeof define === 'function' && define.amd ? define(['exports', 'fs', './nodeStreams.js'], factory) :
	(factory((global['functional/nodeStreams/fileReader'] = global['functional/nodeStreams/fileReader'] || {}, global['functional/nodeStreams/fileReader'].js = {}),global.fs,global.nodeStreams_js));
}(this, (function (exports,fs,nodeStreams_js) { 'use strict';

const fileReadStream = (src, size) => nodeStreams_js.readStream(fs.createReadStream(src), size);

const fileWriteStream = (src, encoding = 'utf8') => nodeStreams_js.writeStream(fs.createWriteStream(src, encoding));

exports.fileReadStream = fileReadStream;
exports.fileWriteStream = fileWriteStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
