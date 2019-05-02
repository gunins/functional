import {none, some} from '../core/Maybe.mjs';
import {option} from './option.mjs';

const isMaybe = (_ = {}) => _ && _.isOption && _.isOption();
const isDefined = (_) => _ !== undefined;

const toMaybe = (value) => option()
    .or(isMaybe(value), () => value)
    .or(!isDefined(value), () => none())
    .finally(() => some(value));

const storage = (copy) => {
    const store = new Map(copy);
    return {
        get(key) {
            return store.get(key) || none()
        },
        getValue(key) {
            const context = store.get(key) || none();
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
            const context = store.get(key) || none();
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

export {storage}
