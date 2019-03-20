let {Stream, stream} = require('../../../dist/functional/core/Stream');
let {task} = require('../../../dist/functional/core/Task');
let {expect} = require('chai');
let {spy} = require('sinon');

describe('Stream Tests: ', () => {
    it('Stream through simple', async () => {
        const instanceSpy = spy();
        const onReadySpy = spy();

        let a = stream(() => {
            instanceSpy();
            return Promise.resolve([1, 2, 3]);
        })
            .onReady((_) => {
                onReadySpy();
                return _.shift()
            });

        const onDataSpy = spy();

        let b = stream((_) => {
            onDataSpy();
            return _ + 1
        }).onData((_) => {
            onDataSpy();
            return _ + 1
        });

        let c = a.through(b).through(b);
        let result = [];

        const resp = await c.onData((_, context) => {
            onDataSpy();
            result = [...(context || []), _];
            return result;
        })
            .run();
        expect(result).to.be.eql([5, 6, 7]);
        expect(result).to.be.eql(resp);
        expect(instanceSpy.calledOnce).to.be.true;
        expect(onReadySpy.callCount).to.be.eql(4);
        expect(onDataSpy.callCount).to.be.eql(15);


    });
    it('Stream map simple', async () => {
        const instanceSpy = spy();

        let a = stream(() => {
            instanceSpy();
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
        let resultA = [];

        const respA = await c.onData((_, context) => {
            resultA = [...(context || []), _ + 1];
            return resultA;
        }).run();


        expect(resultA).to.be.eql([4, 5, 6]);
        expect(resultA).to.be.eql(respA);
        expect(instanceSpy.calledTwice).to.be.true;


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
    it('Stream Error simple', async () => {
        let bool = true;
        let a = stream(() => {
            // console.log('Create Instance A');
            return Promise.resolve([1, 2, 3]);
        }).onReady((_) => {
            // console.log('Ready Instance A');
            return bool ? Promise.resolve(_.shift()) : Promise.reject(_.shift())
        }).onError((instance, context, error) => {
            // console.log('onError 1 |', instance, context, error, '|');
            return Promise.reject(error)
        });
        ;

        let b = stream((_) => {
            // console.log('Ready Create Instance B');

            return _ + 1
        })
            .onError((instance, context, error) => {
                // console.log('onError 2 |', instance, context, error, '|');
                return Promise.reject(error)
            });

        let c = a
            .through(b);

        let result = [];
        try {

            const resp = await c
                .onError((instance, context, error) => {
                    // console.log('onError 3 |', instance, context, error, '|');
                    return Promise.reject(error + 'message')
                })
                .onData((_, context) => {
                    // console.log('OnData Instance C');
                    result = [...(context || []), _];
                    bool = false;
                    return result;
                }).run();
        } catch (error) {
            expect(error).to.be.eql('2message');
        }
        // expect(result).to.be.eql([2, 3, 4]);
        // expect(result).to.be.eql(resp);


    });


});
