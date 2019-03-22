const {Stream, stream} = require('../../../dist/functional/core/Stream');
const {task} = require('../../../dist/functional/core/Task');
const {fileReaderStream, fileWriteStream} = require('../../../dist/functional/fsStreams/fileReader');
const {unlink, rmdir, mkdir, readFileSync} = require('fs');
const path = require('path');
const {expect} = require('chai');
const {spy} = require('sinon');

const tmpDir = path.resolve('./tmp');
const source = path.resolve('./test/functional/core/data/emojilist.txt');
const testDestination = path.resolve('./test/functional/core/data/emojilistUppper.txt');
const destination = path.resolve(tmpDir, './emojilistUppper.txt');
describe('Stream Tests: ', () => {
    beforeEach(async () => {
        await new Promise((resolve) => rmdir(tmpDir, () => {
            resolve();
        }));

        await new Promise((resolve) => mkdir(tmpDir, () => {
            resolve();
        }));

    });
    it('Stream through simple', async () => {
        const readStream = (src) => stream(() => {
            return fileReaderStream(src);
        })
            .onReady((instance) => {
                return instance.read(10);
            })
            .onStop((instance) => {
                return instance.destroy();
            });

        const writeStream = (src) => stream(() => {
            return fileWriteStream(src)
        })
            .onReady((instance, chunk) => {
                return instance.write(chunk)
            })
            .onStop((instance) => {
                return instance.end()
            });


        await readStream(source)
            .map(chunk => chunk.toString('utf8'))
            .map(string => string.toUpperCase())
            .through(writeStream(destination))
            .run();

        const readFileSync1 = readFileSync(testDestination, 'utf8');
        const readFileSync2 = readFileSync(destination, 'utf8');
        expect(readFileSync1).to.eql(readFileSync2);
    });


});
