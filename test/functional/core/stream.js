const {Stream, stream} = require('../../../dist/functional/core/Stream');
const {task} = require('../../../dist/functional/core/Task');
const {expect} = require('chai');
const {spy} = require('sinon');


describe('Stream Tests: ', () => {
    it('Stream through simple', async () => {

        const instanceSpy = spy();
        const onReadySpy = spy();
        const instance = [1, 2, 3];
        const a = stream(() => {
            instanceSpy();
            return Promise.resolve(instance);
        })
            .onReady((_) => {
                onReadySpy();
                return _.shift()
            })
            .onStop((inst, context) => {
                expect(inst).to.be.eql(instance);
                return context;
            });

        const onDataSpy = spy();

        const b = stream((_) => {
            onDataSpy();
            return _ + 1
        }).onData((_) => {
            onDataSpy();
            return _ + 1
        });

        const c = a.through(b).through(b);
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
    it('Stream map parallel simple', async () => {
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

        const strA = c.onData((_, context) => {
            return [...(context || []), _];
        });


        const [A, B, C, D, E] = await Promise.all([
            strA.run(),
            strA.run(),
            strA.run(),
            strA.run(),
            strA.run()
        ]);

        expect(A).to.be.eql([3, 4, 5]);
        expect(B).to.be.eql([3, 4, 5]);
        expect(C).to.be.eql([3, 4, 5]);
        expect(D).to.be.eql([3, 4, 5]);
        expect(E).to.be.eql([3, 4, 5]);

        expect(instanceSpy.callCount).to.be.eql(5);


    });
    it('Stream throughTask simple', async () => {
        const onstopFirst = spy();
        const onstopSecond = spy();
        let a = stream(() => {
            return Promise.resolve([1, 2, 3]);
        }).onReady((_) => {
            return Promise.resolve(_.shift())
        })
            .onStop((instance, _) => {
                onstopFirst();
                return _;
            });

        let b = stream((_) => _ + 1);

        let c = a
            .through(b)
            .throughTask(task(_ => _ + 1));
        let result = [];

        const resp = await c.onData((_, context) => {
            result = [...(context || []), _];
            return result;
        })
            .onStop((instance, _) => {
                onstopSecond();
                return _;
            })
            .run();
        expect(result).to.be.eql([3, 4, 5]);
        expect(result).to.be.eql(resp);
        expect(onstopFirst.calledOnce).to.be.true
        expect(onstopSecond.calledOnce).to.be.true
        expect(onstopSecond.calledAfter(onstopFirst)).to.be.true


    });
    it('Stream Error simple', async () => {
        let bool = true;
        const errorASpy = spy();
        const errorBSpy = spy();
        const errorCSpy = spy();

        let a = stream(() => {
            // console.log('Create Instance A');
            return Promise.resolve([1, 2, 3]);
        }).onReady((_) => {
            // console.log('Ready Instance A');
            return bool ? Promise.resolve(_.shift()) : Promise.reject(_.shift())
        }).onError((instance, context, error) => {
            // console.log('onError 1 |', instance, context, error, '|');
            errorASpy();
            return Promise.reject(error)
        });
        ;

        let b = stream((_) => {
            // console.log('Ready Create Instance B');

            return _ + 1
        })
            .onError((instance, context, error) => {
                // console.log('onError 2 |', instance, context, error, '|');
                errorBSpy();
                return Promise.reject(error)
            });

        let c = a
            .through(b);

        let result = [];
        try {

            const resp = await c
                .onError((instance, context, error) => {
                    // console.log('onError 3 |', instance, context, error, '|');
                    errorCSpy();
                    return Promise.reject(error + 'message')
                })
                .onData((_, context) => {
                    expect(_).to.be.eql(2);
                    expect(context).to.be.undefined;

                    result = [...(context || []), _];
                    bool = false;
                    return result;
                }).run();
        } catch (error) {
            // console.log('Error catched------');
            expect(error).to.be.eql('2message');
            expect(errorASpy.calledOnce).to.be.true;
            expect(errorBSpy.calledOnce).to.be.true;
            expect(errorCSpy.calledOnce).to.be.true;
        }

    });


});
