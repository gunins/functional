const {expect} = require('chai');
const {fileReadStream, fileWriteStream} = require('../../../dist/functional/nodeStreams/fileReader');
const {duplexStream} = require('../../../dist/functional/nodeStreams/nodeStreams');
const {unlink, rmdir, mkdir, readFileSync} = require('fs');

const path = require('path');

const tmpDir = path.resolve('./tmp');



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

const source = path.resolve('./test/functional/core/data/divine-comedy.txt');
const destination = path.resolve(tmpDir, './divine-comedy.txt.gzip');
const destinationUnzip = path.resolve(tmpDir, './divine-gzip.txt');


describe('Stream zlib Tests: ', () => {
    beforeEach(async () => {
        await new Promise((resolve) => rmdir(tmpDir, () => {
            resolve();
        }));

        await new Promise((resolve) => mkdir(tmpDir, () => {
            resolve();
        }));

    });
    it('Stream file read to write', async () => {

        const initVect = randomBytes(16);
        await zipStream(source, destination, 'SECRET', initVect);
        await unzipStream(destination, destinationUnzip, 'SECRET', initVect);

        const readFileSync2 = readFileSync(source, 'utf8');
        const readFileSync1 = readFileSync(destinationUnzip, 'utf8');
        expect(readFileSync1).to.eql(readFileSync2);


    });
});
