(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Maybe'), require('./option')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Maybe', './option'], factory) :
	(factory((global['functional/utils/storage'] = global['functional/utils/storage'] || {}, global['functional/utils/storage'].js = {}),global.Maybe_mjs,global.option_mjs));
}(this, (function (exports,Maybe_mjs,option_mjs) { 'use strict';

const isMaybe = (_ = {}) => _ && _.isOption && _.isOption();
const isDefined = (_) => _ !== undefined;

const toMaybe = (value) => option_mjs.option()
    .or(isMaybe(value), () => value)
    .or(!isDefined(value), () => Maybe_mjs.none())
    .finally(() => Maybe_mjs.some(value));

const storage = (copy) => {
    const store = new Map(copy);
    return {
        get(key) {
            return store.get(key) || Maybe_mjs.none()
        },
        getValue(key) {
            const context = store.get(key) || Maybe_mjs.none();
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
            const context = store.get(key) || Maybe_mjs.none();
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
