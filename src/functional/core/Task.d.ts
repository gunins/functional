type fn<A, B = void> = (a: A) => B;

export type taskJob<A> = (_: A) => A | A;

export class Task<A> {

	constructor(job?: taskJob<A>, parent?: Task<A>)

	copy(): Task<A>;

	map<B>(fn: fn<A, B>): Task<B>;

	flatMap<B>(fn: fn<A, B>): Task<B>;

	through<B, C>(joined: Task<B>): Task<C>;

	forEach(fn: fn<A, void>): void;

	resolve(fn: fn<A, void>): Task<A>;

	reject(fn: fn<A, void>): Task<A>;

	isTask(): boolean;

	toString(): string;

	clear(): Task<A>

	unsafeRun<B>(resolve?: fn<A, void>, reject?: fn<A, void>): Promise<B>;

	static empty(): Task<undefined>;

	static all<B, C>(tasks: Task<B>[], context: C): Promise<B>
}

export function task<A>(job?: taskJob<A>, parent?: Task<A>): Task<A>

