let {Stream, stream} = require('../../../dist/functional/core/Stream');
let {task} = require('../../../dist/functional/core/Task');
let {expect} = require('chai');
let {spy} = require('sinon');

describe.skip('Stream Tests: ', () => {
    it('Stream through simple', async () => {
        let a = stream(() => {
            return Promise.resolve([1, 2, 3]);
        })
            .onReady((_) => _.shift());
        let step = 0
        let b = stream((_) => {
            console.log('B Stream', _, step++);
            return _ + 1
        });

        let c = a.through(b).through(b).through(b);
        let result = [];

        const resp = await c.onData((_, context) => {
            console.log('onData', _, step++);

            result = [...(context || []), _];
            return result;
        })
        .run();
        // expect(result).to.be.eql([2, 3, 4]);
        // expect(result).to.be.eql(resp);


    });
    it('Stream map simple', async () => {
        let a = stream(() => {
            return Promise.resolve([1, 2, 3]);
        }).onReady((_) => {
            return Promise.resolve(_.shift())
        })
        // .onError((data) => console.log('Error', data));

        let b = stream((_) => _ + 1);

        let c = a
            .through(b)
            .map(_ => _ + 1);
        let result = [];

        const resp = await c.onData((_, context) => {
            result = [...(context || []), _];
            return result;
        }).run();

        expect(result).to.be.eql([3, 4, 5]);
        expect(result).to.be.eql(resp);

        /* let resultA = [];

         const respA = await c.onData((_, context) => {
             resultA = [...(context || []), _];
             return resultA;
         }).run();

         expect(resultA).to.be.eql([3, 4, 5]);
         expect(resultA).to.be.eql(respA);*/


    });
    it('Stream throughTask simple', async () => {
        let a = stream(() => {
            return Promise.resolve([1, 2, 3]);
        }).onReady((_) => {
            return Promise.resolve(_.shift())
        });

        let b = stream((_) => _ + 1);

        let c = a
            .through(b)
            .throughTask(task(_ => _ + 1));
        let result = [];

        const resp = await c.onData((_, context) => {
            result = [...(context || []), _];
            return result;
        }).run();
        expect(result).to.be.eql([3, 4, 5]);
        expect(result).to.be.eql(resp);


    });


});
