(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fs')) :
	typeof define === 'function' && define.amd ? define(['exports', 'fs'], factory) :
	(factory((global['functional/fsStreams/fileReader'] = global['functional/fsStreams/fileReader'] || {}, global['functional/fsStreams/fileReader'].js = {}),global.fs));
}(this, (function (exports,fs) { 'use strict';

const fileReaderStream = (src) => new Promise((resolve) => {
    const stream = fs.createReadStream(src);
    stream.on('readable', () => resolve(stream));
});
const fileWriteStream = async (src) => {
    const stream = fs.createWriteStream(src);
    return {
        write(chunk){
            return new Promise((resolve) => stream.write(chunk, 'utf8', () => resolve(chunk)))
        },
        end(chunk){
            return new Promise((resolve) => stream.end(chunk, 'utf8', () => resolve(chunk)))
        }
    }

};

exports.fileReaderStream = fileReaderStream;
exports.fileWriteStream = fileWriteStream;

Object.defineProperty(exports, '__esModule', { value: true });

})));
