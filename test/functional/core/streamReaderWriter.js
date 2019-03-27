const {fileReadStream, fileWriteStream} = require('../../../dist/functional/nodeStreams/fileReader');
const rmdirRecursiveSync = require('rmdir-recursive').sync;
const {mkdirSync, readFileSync} = require('fs');

const path = require('path');
const {expect} = require('chai');

const tmpDir = path.resolve('./tmp');
const source = path.resolve('./test/functional/core/data/emojilist.txt');
const testDestination = path.resolve('./test/functional/core/data/emojilistUppper.txt');
const destination = path.resolve(tmpDir, './emojilistUppper.txt');
describe('Stream Tests: ', () => {
    beforeEach(() => {
        rmdirRecursiveSync(tmpDir);
        mkdirSync(tmpDir);

    });
    it('Stream file read to write', async () => {

        const fileStream = fileReadStream(source, 10)
            .map(chunk => chunk.toString('utf8'))
            .map(string => string.toUpperCase())
            .through(fileWriteStream(destination));

        await fileStream.run();

        const readFileSync1 = readFileSync(testDestination, 'utf8');
        const readFileSync2 = readFileSync(destination, 'utf8');
        expect(readFileSync1).to.eql(readFileSync2);
    });


});
