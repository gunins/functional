import {Task} from "./Task";

type fn<A, B = void> = (a: A) => B;

export class Stream<A> {
    constructor(job: A, parent?: Stream<A>)

    copy(): Stream<A>;

    // will take a functor (chunk)=>Promise
    // return new stream instance
    map<B>(fn: fn<A, B>): Stream<B>


    through<B, C>(joined: Stream<B>): Stream<C>;

    throughTask<B, C>(_task: Task<B>): Stream<C>;


    onReady<B>(cb: fn<A, B>): Stream<A>;

    /* // OPTIONAL: event to pause, for example filereader, or web socket
     // return same instance
     onPause(cb) {
         this[_stream].set(_onPause, toPromise(cb));
         return this;

     };

     //OPTIONAL: event to resume stream.
     // return same instance
     onResume(cb) {
         this[_stream].set(_onResume, toPromise(cb));
         return this;
     };*/

    //OPTIONAL: In case need to destroy instance
    // callback will take arguments (instance, context, data)=>Promise
    // return same instance
    onStop<B>(callback: fn<A, B>): Stream<A>;

    // OPTIONAL: every time data collected
    // Will return, chunk, and scope context. In case you need to manage own history.
    // callback will take arguments (data, context, instance)=>Promise
    // return same instance
    onData<B>(callback: fn<A, B>): Stream<A>;

    // OPTIONAL: handling error.
    // return same instance
    // callback will take arguments (instance, context, error)=>Promise
    onError<B>(callback: fn<A, Promise<B>>): Stream<A>

    // boolean, if stream instance or not
    isStream(): boolean;


    // Runs stream till return null. Will return Promise with instance context
    run<B>(): Promise<B>;


    toString() :string;

    //Returns Empty Stream
    static empty() :Stream<undefined>;
}

export function stream<A>(job: A, parent?: Stream<A>): Stream<A>;

