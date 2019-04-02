(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fs'), require('./nodeStreams')) :
	typeof define === 'function' && define.amd ? define(['exports', 'fs', './nodeStreams'], factory) :
	(factory((global['functional/nodeStreams/fileReader'] = global['functional/nodeStreams/fileReader'] || {}, global['functional/nodeStreams/fileReader'].js = {}),global.fs,global.nodeStreams));
}(this, (function (exports,fs,nodeStreams) { 'use strict';

const fileReadStream = (src, size) => nodeStreams.readStream(fs.createReadStream(src), size);

const fileWriteStream = (src, encoding = 'utf8') => nodeStreams.writeStream(fs.createWriteStream(src, encoding));

exports.fileReadStream = fileReadStream;
exports.fileWriteStream = fileWriteStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
