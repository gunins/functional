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
        let callback = spy();
        let a = task((resolve) => resolve(3)).map((res, rej, d) => {
            callback();
            res(d + 1)
        });

        a.unsafeRun(resolve => {
            expect(resolve).to.be.eql(4);
            expect(callback.calledOnce).to.be.true;
            done()
        });
    });

    it('test multi map task', (done) => {
        let callback = spy();
        let a = task((resolve) => resolve(3)).map((res, rej, d) => {
            callback();
            res(d + 1)
        });

        let b = a.map((res, rej, d) => {
            callback();

            res(d + 1);
        }).map((res, rej, d) => {
            callback();
            res(d + 1);
        });

        b.map((res, rej, d) => {
            expect(d).to.be.eql(6);
            callback();
            res(d);
        });

        a.unsafeRun(resolve => {
            callback();
            expect(resolve).to.be.eql(4);
            expect(callback.callCount).to.be.eql(5);
            done();

        });
    });

    it('test forEach task', (done) => {
        let a = task((resolve) => resolve(3)).forEach((d) => {
            expect(d).to.be.eql(3);
        });

        a.unsafeRun(resolve => {
            expect(resolve).to.be.eql(3);
            done()
        });
    });

    it('test forEach + map task', (done) => {
        let a = task((resolve) => resolve(3)).forEach((d) => {
            expect(d).to.be.eql(3);
        }).map((res, rej, d) => {
            res(d + 1)
        });

        a.unsafeRun(resolve => {
            expect(resolve).to.be.eql(4);
            done()
        });
    });

    it('test multi map +forEach task', (done) => {
        let a = task((resolve) => resolve(3)).map((res, rej, d) => {
            res(d + 1)
        });

        let b = a.map((res, rej, d) => {
            res(d + 1);
        }).map((res, rej, d) => {
            expect(d).to.be.eql(5);
            res(d + 1);
        });

        b.forEach((d) => {
            expect(d).to.be.eql(6);
        });

        a.unsafeRun(resolve => {
            expect(resolve).to.be.eql(4);
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
    it('test reject task', (done) => {
        let a = task((_, reject) => reject('rejected'));
        a.unsafeRun(() => {
        }, error => {
            expect(error).to.be.eql('rejected');
            done();
        });
    });

    it('test reject map', (done) => {
        let callback = spy();
        let a = task((_, reject) => reject('rejected')).map((res) => {
            callback();
            res(3)
        });
        a.unsafeRun(() => {
        }, error => {
            expect(error).to.be.eql('rejected');
            expect(callback.notCalled).to.be.true;
            done();
        });
    });

    it('test reject belowmap', (done) => {
        let callback = spy();
        let a = task((resolve) => resolve(1)).map((res, rej, d) => {
            callback();
            res(d + 1)
        }).map((res, rej, d) => {
            rej(d)
        }).map((res, rej, d) => {
            callback();
            rej(d)
        });

        a.unsafeRun(() => {
        }, error => {
            expect(error).to.be.eql(2);
            expect(callback.calledOnce).to.be.true;
            done();
        });
    });

    it('test resolver', (done) => {
        let callback = spy();
        task((resolve) => resolve(1)).resolve(data => {
            callback();
            expect(data).to.be.eql(1);
        }).unsafeRun().then(data => {
            expect(data).to.be.eql(1);
            expect(callback.calledOnce).to.be.true;
            done();
        });
    });
    it('test clear resolver', (done) => {
        let callback = spy();
        task((resolve) => resolve(1))
            .resolve(data => {
                callback();
                expect(data).to.be.eql(1);
            })
            .clear()
            .unsafeRun().then(data => {
            expect(data).to.be.eql(1);
            expect(callback.notCalled).to.be.true;
            done();
        });
    });

    it('test multiple resolver', (done) => {
        let callback = spy();
        task((resolve) => resolve(1))
            .resolve(data => {
                callback();
                expect(data).to.be.eql(1);
            }).map((res, rej, d) => {
            res(d + 1);
        }).resolve(data => {
            callback();
            expect(data).to.be.eql(2);
        }).unsafeRun().then(data => {
            expect(data).to.be.eql(2);
            expect(callback.calledTwice).to.be.true;
            done();
        });
    });

    it('test complex resolver', (done) => {
        let callback = spy();
        let triggerOne = false;
        let triggerTwo = false;
        let a = task((resolve) => resolve(1))
            .resolve(data => {
                callback();
                expect(data).to.be.eql(1);
            });

        let b = a.map((res, rej, d) => {
            res(d + 1);
        }).resolve(data => {
            if (!triggerOne) {
                triggerOne = true;
                expect(callback.calledOnce).to.be.true;
            } else if (!triggerTwo) {
                triggerTwo = true;
                expect(callback.calledTwice).to.be.true;
            }
            callback();
            expect(data).to.be.eql(2);
        });


        a.unsafeRun(data => {
            expect(data).to.be.eql(1);
            expect(callback.calledTwice).to.be.true;
        });

        a.unsafeRun(data => {
            expect(data).to.be.eql(1);
            expect(callback.calledThrice).to.be.true;
        }, err=>{
            console.log(err,'error');
        });

        b.unsafeRun().then(data => {
            expect(data).to.be.eql(2);
            done();
        });
    });

    it('test rejecter', (done) => {
        let callback = spy();
        task((_, reject) => reject(1)).reject(data => {
            callback();
            expect(data).to.be.eql(1);
        }).unsafeRun(() => {
        }, data => {
            expect(data).to.be.eql(1);
            expect(callback.calledOnce).to.be.true;
            done();
        });
    });
    /*it('test multiple rejecter', (done) => {
        let callback = spy();
        task((_, reject) => resolve(1))/!*.reject(data => {
            callback();
            expect(data).to.be.eql(1);
        })*!/.map((res,rej,d)=>{
            rej(d+1)
        })/!*.reject(data => {
            callback();
            expect(data).to.be.eql(2);
        })*!/.unsafeRun(() => {
        }, data => {
            // expect(data).to.be.eql(2);
            // expect(callback.calledOnce).to.be.true;
            done();
        });
    });*/


});
