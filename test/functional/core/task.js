let {Task, task} = require('../../../dist/functional/core/Task'),
    {expect} = require('chai');
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
            a.unsafeRun((b) => {
                expect(b).to.be.eql(3);
                done()
            });
        }, 100)
    });

    it('test syncronus function', async () => {
        let resolver = () => 3;
        let a = task(resolver);
        let b = await a.unsafeRun();
        expect(b).to.be.eql(3);
    });

    it('test task reject', (done) => {
        let a = task((res, rej) => {
            rej('Task Error');
        });
        a.unsafeRun(() => {
        }, error => {
            expect(error).to.be.eql('Task Error');
            done();
        });

    });

    it('test empty task', (done) => {
        let a = task();
        a.unsafeRun(() => {
        }, error => {
            expect(error).to.be.eql('Task Empty');
            done();
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
