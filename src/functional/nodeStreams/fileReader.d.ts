import {Stream} from '../core/Stream';

export function fileReadStream<A>(src: string, size?: number): Stream<A>;

export function fileWriteStream<A>(src: string, encoding?: string): Stream<A>;



