(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Option'), require('./option')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Option', './option'], factory) :
	(factory((global['functional/utils/storage'] = global['functional/utils/storage'] || {}, global['functional/utils/storage'].js = {}),global.Option,global.option));
}(this, (function (exports,Option,option) { 'use strict';

const isMaybe = (_ = {}) => _ && _.isOption && _.isOption();
const isDefined = (_) => _ !== undefined;

const toMaybe = (value) => option.option()
    .or(isMaybe(value), () => value)
    .or(!isDefined(value), () => Option.none())
    .finally(() => Option.some(value));

const storage = (copy) => {
    const store = new Map(copy);
    return {
        get(key) {
            return store.get(key) || Option.none()
        },
        getValue(key) {
            const context = store.get(key) || Option.none();
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
            const context = store.get(key) || Option.none();
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
