(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../core/Maybe'), require('./option')) :
	typeof define === 'function' && define.amd ? define(['exports', '../core/Maybe', './option'], factory) :
	(factory((global['functional/utils/storage'] = global['functional/utils/storage'] || {}, global['functional/utils/storage'].js = {}),global.Maybe,global.option));
}(this, (function (exports,Maybe,option) { 'use strict';

const isMaybe = (_ = {}) => _ && _.isOption && _.isOption();
const isDefined = (_) => _ !== undefined;

const toMaybe = (value) => option.option()
    .or(isMaybe(value), () => value)
    .or(!isDefined(value), () => Maybe.none())
    .finally(() => Maybe.some(value));

const storage = (copy) => {
    const store = new Map(copy);
    return {
        get(key) {
            return store.get(key) || Maybe.none()
        },
        getValue(key) {
            const context = store.get(key) || Maybe.none();
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
            const context = store.get(key) || Maybe.none();
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
