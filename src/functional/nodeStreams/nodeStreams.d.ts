import {Stream} from '../core/Stream';
import {Stream as NodejsStream} from 'stream'

export interface StreamOptions {
	size?: number;
}

export function readStream<A>(instance: NodejsStream, options: StreamOptions): Stream<A>

export function writeStream<A>(instance: NodejsStream): Stream<A>

export function duplexStream<A>(instance: NodejsStream, options: StreamOptions): Stream<A>
