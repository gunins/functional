import {
    createReadStream,
    createWriteStream
} from 'fs';

const fileReaderStream = (src) => new Promise((resolve) => {
    const stream = createReadStream(src);
    stream.on('readable', () => resolve(stream));
});
const fileWriteStream = async (src) => {
    const stream = createWriteStream(src);
    return {
        write(chunk, encoding ='utf8'){
            return new Promise((resolve) => stream.write(chunk, encoding, () => resolve(chunk)))
        },
        end(chunk, encoding ='utf8'){
            return new Promise((resolve) => stream.end(chunk, encoding, () => resolve(chunk)))
        }
    }

};

export {fileReaderStream, fileWriteStream}


