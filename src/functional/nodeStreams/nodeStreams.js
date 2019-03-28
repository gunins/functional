import {stream} from '../core/Stream';

const {assign} = Object;
const readPromise = (stream, size) => new Promise((resolve) => stream.on('readable', () => resolve({
    async read() {
        return stream.read(size);
    },
    async destroy() {
        stream.destroy();
        return null;
    }
})));

const writePromise = async (stream) => {
    return ({
        write(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream.write(chunk, encoding, () => resolve(chunk)))
        },
        end(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream.end(chunk, encoding, (..._) => resolve(chunk)))
        },
        finished(chunk) {
            return new Promise((resolve) => stream.finished(chunk, () => resolve(chunk)))
        },
        async destroy() {
            stream.destroy();
            return null;
        },
        on(name, cb) {
            return stream.on(name, (..._) => cb(..._))
        },
        once(name) {
            return new Promise((resolve) => stream.once(name, (_) => resolve(_)))
        },
        readLast(chunk) {
            return new Promise((resolve) => {
                let chunks = Buffer.alloc(0);
                stream.on('data', (_) => {
                    chunks = Buffer.concat([chunks, _]);
                });
                stream.on('end', () => resolve(chunks));
                stream.end(chunk);
            })
        },
        async close() {
            return stream.close();
        },
        async pause() {
            return stream.pause();
        },
        async resume() {
            return stream.resume();
        }
    });
};

const duplexPromise = (stream) => {
    return writePromise(stream)
        .then((writer) => {
            return assign({
                read(...args) {
                    return Promise.resolve(stream.read(...args))

                }
            }, writer)
        });
};


const readStream = (instance, ...args) => {
    return stream(() => readPromise(instance, ...args))
        .onReady((instance) => instance.read())
        .onStop((instance) => instance.destroy());
};

const writeStream = (instance) => stream(() => writePromise(instance))
    .onReady((instance, chunk) => instance.write(chunk))
    .onStop((instance, context, data) => instance.end(data));

const duplexStream = (instance) => stream(() => duplexPromise(instance))
    .onReady((instance, context) => instance.write(context))
    .onData((chunk, context, instance) => instance.read())
    .onStop((instance, context, data) => instance.readLast(data));


export {writeStream, readStream, duplexStream}
