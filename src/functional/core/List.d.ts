type fn<A, B> = (a: A) => B;

export class List<A> {
    constructor(head: A, ...tail: A[])

    getOrElse<B>(fn: fn<A, B>): List<B>

    insert(head: A): List<A>

    add(head: A): List<A>

    copy(): List<A>

    concat(...lists: List<A>[]): List<A>

    reverse(): List<A>;


    foldLeft<B, C>(a: B, fn: (a: B, A) => C): B

    foldRight<B, C>(a: B, fn: (a: B, A) => C): B;

    find(fn:(a:A)=>boolean):A;


    filter(fn:(a:A)=>boolean) :List<A>;

    map<B>(fn:fn<A,B>):B

    forEach(fn:fn<A,void>) :void

    flatMap<B>(fn:fn<A,B>):List<B> ;

    size() :number;

    take(count:number) :List<A>;

    toString():string;

    isList() :boolean;

    toArray() :A[]

    static empty(): List<undefined>


}

export function list<A>(...fns: A[]): List<A>
