import {
    createReadStream,
    createWriteStream
} from 'fs';

const srcStream = (streamInstance) => (src) => new Promise((resolve) => {
    const stream = streamInstance(src);
    stream.on('readable', () => resolve(stream));
}).then((stream)=>stream);

const fileReaderStream = srcStream(createReadStream);
const fileWriteStream = srcStream(createWriteStream);

export {fileReaderStream, fileWriteStream}


