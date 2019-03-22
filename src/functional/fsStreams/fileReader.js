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
        write(chunk){
            return new Promise((resolve) => stream.write(chunk, 'utf8', () => resolve(chunk)))
        },
        end(chunk){
            return new Promise((resolve) => stream.end(chunk, 'utf8', () => resolve(chunk)))
        }
    }

};

export {fileReaderStream, fileWriteStream}


