let {Task, task} = require('../../../dist/functional/core/Task'),
    {expect} = require('chai'),
    {spy} = require('sinon');
describe('Task Tests: ', () => {
    it('test task success', async () => {
        let a = new Task((resolve) => resolve(3));
        let b = await a.unsafeRun();
        expect(b).to.be.eql(3);
    });

    it('test task not function', async () => {
        let a = new Task({a: 3});
        let b = await a.unsafeRun();
        expect(b).to.be.eql({a: 3});
    });
    it('test chaining task not function', async () => {
        let a = await task({a: 3}).unsafeRun();
        expect(a).to.be.eql({a: 3});
    });

    it('test task success delay', (done) => {
        let resolver = (resolve) => setTimeout(() => resolve(3), 50);
        let a = task(resolver);
        setTimeout(() => {
            a.unsafeRun(resolve => {
                expect(resolve).to.be.eql(3);
                done()
            });
        }, 100)
    });

    it('test syncronus function', async () => {
        let res = spy(),
            resolver = () => {
                res();
                return 'success';
            };
        let a = task(resolver);
        let b = await a.unsafeRun();
        expect(res.calledOnce).to.be.true;
    });

    it('test task reject', (done) => {
        let a = task((res, rej) => {
                rej('Task Error');
            }),
            res = spy(),
            rej = spy();
        a.unsafeRun(resolve => {
            res()
        }, reject => {
            rej();
            expect(reject).to.be.eql('Task Error');
        });

        setTimeout(() => {
            expect(res.notCalled).to.be.true;
            expect(rej.calledOnce).to.be.true;
            done();
        }, 10)

    });

    it('test empty task', (done) => {
        let a = task();
        a.unsafeRun(resolve => {
        }, reject => {
            expect(reject).to.be.eql('Task Empty');
            done();
        });
    });

    it('test map task', (done) => {
        let a = task((resolve) => resolve(3)).map((res,rej, d) => {
            return res(d + 1)
        });
        a.unsafeRun(resolve => {
            expect(resolve).to.be.eql(4);
            done()
        });
    });

    it('test empty static task', (done) => {
        let a = Task.empty();
        a.unsafeRun(() => {
        }, error => {
            expect(error).to.be.eql('Task Empty');
            done();
        });
    });

});
