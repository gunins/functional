import {
    createReadStream,
    createWriteStream
} from 'fs';

import {stream} from '../core/Stream';

const fileReadPromise = (src) => new Promise((resolve) => {
    const stream = createReadStream(src);
    stream.on('readable', () => resolve(stream));
});
const fileWritePromise = async (src) => {
    const stream = createWriteStream(src);
    return {
        write(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream.write(chunk, encoding, () => resolve(chunk)))
        },
        end(chunk, encoding = 'utf8') {
            return new Promise((resolve) => stream.end(chunk, encoding, () => resolve(chunk)))
        }
    }

};

const fileReadStream = (src, size = 10) => stream(() => fileReadPromise(src))
    .onReady((instance) => instance.read(size))
    .onStop((instance) => instance.destroy());

const fileWriteStream = (src, encoding = 'utf8') => stream(() => fileWritePromise(src, encoding))
    .onReady((instance, chunk) => instance.write(chunk))
    .onStop((instance) => instance.end());

export {fileReadStream, fileWriteStream}


