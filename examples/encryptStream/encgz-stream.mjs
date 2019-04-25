import {fileReadStream, fileWriteStream} from '../../src/functional/nodeStreams/fileReader';
import {duplexStream} from '../../src/functional/nodeStreams/nodeStreams';
import path from 'path';


import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash
} from 'crypto';

import {createGzip, createGunzip} from 'zlib';


const source = path.resolve('./data/divine-comedy.txt');
const destination = path.resolve('./divine-comedy.txt.gzip');
const destinationUnzip = path.resolve('./divine-gzip.txt');

const getChiperKey = (secret) => createHash('md5')
    .update(secret)
    .digest('hex');

const initVect = randomBytes(16);

const encodeGZip = (secret, initVect) => createCipheriv('aes256', getChiperKey(secret), initVect);


const decodeGzip = (secret, initVect) => createDecipheriv('aes256', getChiperKey(secret), initVect);


const zipStream = (source, destination, secret, initVect) => fileReadStream(source,{size:100})
    .map(_ => _.toString('utf8'))
    .map(_ => _.toUpperCase())
    .map(_ => Buffer.from(_, 'utf8'))
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


