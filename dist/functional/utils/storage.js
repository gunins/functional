(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Option.js'), require('./option.js')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Option.js', './option.js'], factory) :
	(factory((global['functional/utils/storage'] = global['functional/utils/storage'] || {}, global['functional/utils/storage'].js = {}),global.Option_js,global.option_js));
}(this, (function (exports,Option_js,option_js) { 'use strict';

const isMaybe = (_ = {}) => _ && _.isOption && _.isOption();
const isDefined = (_) => _ !== undefined;

const toMaybe = (value) => option_js.option()
    .or(isMaybe(value), () => value)
    .or(!isDefined(value), () => Option_js.none())
    .finally(() => Option_js.some(value));

const storage = (copy) => {
    const store = new Map(copy);
    return {
        get(key) {
            return store.get(key) || Option_js.none()
        },
        getValue(key) {
            const context = store.get(key) || Option_js.none();
            return context.get();
        },
        set(key, value) {
            const data = toMaybe(value);
            store.set(key, data);
            return data;
        },
        has(key) {
            return store.has(key);
        },
        once(key) {
            const context = store.get(key) || Option_js.none();
            store.delete(key);
            return context;
        },
        delete(key) {
            return store.delete(key);
        },
        clear() {
            store.clear();
        },
        copy() {
            return storage(store);
        }

    }
};

exports.storage = storage;

Object.defineProperty(exports, '__esModule', { value: true });

})));
