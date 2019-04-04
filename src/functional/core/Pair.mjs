import {some} from './Maybe';

const isFunction = (fn) => typeof fn === 'function';
const isOption = (opt) => opt.isOption && opt.isOption();
const pair = (...args) => new Pair(...args);

class Pair {
    constructor(left, right) {
        if (!isFunction(left) && !isFunction(right)) {
            throw new TypeError('Must provide two functions')
        }
        this.left = isOption(left) ? left : some(left);
        this.right = isOption(right) ? right : some(right);
    }

    isPair() {
        return ['[object Pair]'].indexOf(this.toString()) !== -1
    }

    merge(m) {
        return fn(this.left, this.right)
    }

    swap(f, g) {
        return pair(g(this.right), f(this.left))
    }

    map(fn) {
        return pair(this.left, fn(this.right));
    }

    flatMap(fn) {
        const result = fn(this.left, this.right);
        if (!result.isPair && !result.isPair()) {
            throw new TypeError('Must provide two values')
        }
        return result;
    }

    bimap(f, g) {
        return pair(f(this.left), g(this.right));
    }

    toArray() {
        return [this.left.get(), this.right.get()]
    }

    toString() {
        return '[object Pair]';
    };

}

