const {fileReadStream, fileWriteStream} = require('../../dist/functional/nodeStreams/fileReader');
const {duplexStream} = require('../../dist/functional/nodeStreams/nodeStreams');
const path = require('path');

const source = path.resolve('./data/divine-comedy.txt');
const destination = path.resolve('./divine-comedy.txt.gzip');
const destinationUnzip = path.resolve('./divine-gzip.txt');

const {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash
} = require('crypto');
const {createGzip, createGunzip} = require('zlib');

const getChiperKey = (secret) => createHash('md5')
    .update(secret)
    .digest('hex');

const initVect = randomBytes(16);

function createEncgz(secret, initVect) {
    const cipherKey = getChiperKey(secret);
    return createCipheriv('aes256', cipherKey, initVect).pipe(createGzip())
}

function createDecgz(secret, initVect) {
    const cipherKey = getChiperKey(secret);
    return createDecipheriv('aes256', cipherKey, initVect).pipe(createGunzip())
}

const zipStream = () => fileReadStream(source)
    .through(duplexStream(createEncgz('SECRET', initVect)))
    .through(fileWriteStream(destination));

const unzipStream = () => fileReadStream(destination)
    .through(duplexStream(createDecgz('SECRET', initVect)))
    .through(fileWriteStream(destinationUnzip));

console.log(initVect);
zipStream().run()
    .then(() => console.log('zip finished'))
    .then(() => unzipStream().run())
    .then(() => console.log('unzip finished'));

