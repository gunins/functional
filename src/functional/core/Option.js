let some = (value) => new Some(value)
let none = () => new None();

class Some {
    constructor(value) {
        this.value = value;
    }

    isSome() {
        return true
    }

    get() {
        return this.value;
    }

    set(value) {
        return some(value);
    }

    isEmpty() {
        return this.value ? false : true;
    }

    getOrElse(defaultVal) {
        return this.isSome() ? this.value : defaultVal
    }

    toString() {
        return '[object Some]';
    }
}

class None extends Some {
    constructor() {
        super();
    }

    isSome() {
        return false;
    }

    set(value) {
        return none();
    }

    toString() {
        return '[object None]';
    }

}
export
{
    Some, some, None, none
}


