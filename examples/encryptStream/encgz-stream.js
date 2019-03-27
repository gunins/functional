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

const createEncgz = (secret, initVect) => createCipheriv('aes256', getChiperKey(secret), initVect);


const createDecgz = (secret, initVect) => createDecipheriv('aes256', getChiperKey(secret), initVect);


const zipStream = (source, destination, secret, initVect) => fileReadStream(source)
    .through(duplexStream(createEncgz(secret, initVect)))
    .through(duplexStream(createGzip()))
    .through(fileWriteStream(destination))
    .run();

const unzipStream = (source, destination, secret, initVect) => fileReadStream(source)
    .through(duplexStream(createGunzip()))
    .through(duplexStream(createDecgz(secret, initVect)))
    .through(fileWriteStream(destination))
    .run();

console.log('initVect', initVect);
zipStream(source, destination,'SECRET', initVect)
    .then(() => console.log('zip finished'))
    .then(() => unzipStream(destination, destinationUnzip,'SECRET', initVect))
    .then(() => console.log('unzip finished'));

