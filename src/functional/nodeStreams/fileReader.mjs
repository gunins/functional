import {
    createReadStream,
    createWriteStream
} from 'fs';

import {readStream, writeStream} from './nodeStreams';

const fileReadStream = (src, size) => readStream(createReadStream(src), size);

const fileWriteStream = (src, encoding = 'utf8') => writeStream(createWriteStream(src, encoding));

export {fileReadStream, fileWriteStream}


