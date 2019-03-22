const {Stream, stream} = require('../../../dist/functional/core/Stream');
const {task} = require('../../../dist/functional/core/Task');
const {fileReaderStream, fileWriteStream} = require('../../../dist/functional/fsStreams/fileReader');
const {unlink} = require('fs');
const {expect} = require('chai');
const {spy} = require('sinon');

const source = '/Users/guntarssimanskis/github/Tasks/test/functional/core/data/emojilist.txt';
const destination = '/Users/guntarssimanskis/github/Tasks/test/functional/core/data/emojilistUppper.txt';
describe.only('Stream Tests: ', () => {
    beforeEach(async () => {
       await new Promise((resolve)=>unlink(destination,()=>{
           resolve();
       }));
    });
    it('Stream through simple', async () => {
        const readStream = stream(() => {
            return fileReaderStream(source);
        })
            .onReady((instance) => {
                return instance.read(10);
            })
            .onStop((context, instance) => {
                console.log('Destroy');
                return instance.destroy();
            });


        const toUpperUTF8Stream = stream((chunk) => {
            return chunk.toString('utf8');
        });

        const toUpperCaseStream = stream((chunk) => {
            return chunk.toUpperCase();
        });

        const writeStream = stream(() => {
            return fileWriteStream(destination)
        })
            .onReady((instance, chunk) => {
                return instance.write(chunk)
            })
            .onStop((context, instance) => {
                return instance.end()
            });

        const sampleStream = await readStream
            .through(toUpperUTF8Stream)
            .through(toUpperCaseStream)
            .through(writeStream)
            .map(_ => {
                console.log('String Content', _);
                return _
            })
            .run();
        console.log('Total Finish',sampleStream);


    });


});
