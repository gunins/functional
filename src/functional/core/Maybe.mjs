export const some = (value) => new Some(value)
export const none = () => new None();

const _value = Symbol('_value');
export class Some {
    constructor(value) {
        this[_value] = value;
    };

    isSome() {
        return ['[object Some]'].indexOf(this.toString()) !== -1
    };

    isOption() {
        return this.isMaybe();
    }
    isMaybe() {
        return ['[object Some]', '[object None]'].indexOf(this.toString()) !== -1;
    }

    get() {
        return this[_value];
    };

    map(fn) {
        return this.isSome() ? some(fn(this.get())) : none();
    };

    flatMap(fn) {
        const out = fn(this.get());
        if (out.isOption && out.isOption()) {
            return out;
        } else {
            throw new ReferenceError('Must return an Option');
        }

    }

    set(value) {
        return some(value);
    };

    isEmpty() {
        return this[_value] ? false : true;
    };

    getOrElse(defaultVal) {
        return this.isSome() ? this[_value] : defaultVal
    };

    getOrElseLazy(defaultVal = () => {
    }) {
        return this.isSome() ? this[_value] : defaultVal()
    };

    toString() {
        return '[object Some]';
    };
}

export class None extends Some {
    constructor() {
        super();
    };

    isSome() {
        return false;
    };

    set(value) {
        return none();
    };

    toString() {
        return '[object None]';
    };

}

/*export
{
    Some, some, None, none
}*/


