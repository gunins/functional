type fn<A, B> = (a: A) => B;

export class Some<A> {
    constructor(value: A)

    isSome(): boolean;

    isMaybe(): boolean;

    get(): A;

    map<B>(a: fn<A, B>): B;

    flatMap<B>(a: fn<A, B>): Some<B> | None;

    set<B>(a: B): Some<B>;

    isEmpty(): boolean;

    getOrElse<B>(b: B): A | B;

    getOrElseLazy<B>(a: () => B): A | B;

    toString(): string;
}

export class None extends Some<undefined> {
    isSome(): false;

    set(a: any): None;

    toString(): string;

}

export function some<A>(a: A): Some<A>

export function none(a?: any): None
