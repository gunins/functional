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

const encodeGZip = (secret, initVect) => createCipheriv('aes256', getChiperKey(secret), initVect);


const decodeGzip = (secret, initVect) => createDecipheriv('aes256', getChiperKey(secret), initVect);


const zipStream = (source, destination, secret, initVect) => fileReadStream(source)
    // .map(_ => _.toString('utf8'))
    // .map(_ => _.toUpperCase())
    // .map(_ => Buffer.from(_, 'utf8'))
    .through(duplexStream(createGzip()))
    .through(duplexStream(encodeGZip(secret, initVect)))
    .through(fileWriteStream(destination))
    .run();

const unzipStream = (source, destination, secret, initVect) => fileReadStream(source)
    .through(duplexStream(decodeGzip(secret, initVect)))
    .through(duplexStream(createGunzip()))
    .through(fileWriteStream(destination))
    .run();

console.log('initVect', initVect);
zipStream(source, destination, 'SECRET', initVect)
    .then(() => console.log('zip finished'))
    .then(() => unzipStream(destination, destinationUnzip, 'SECRET', initVect))
    .then(() => console.log('unzip finished'));

