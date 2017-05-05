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

        a.unsafeRun()
            .then(data => {
                res()
            })
            .catch(reject => {
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
        a.unsafeRun().then(resolve => {
            expect(resolve).to.be.undefined;
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
            expect(callback.callCount).to.be.eql(5);
            done();
        });

        a.unsafeRun(resolve => {
            callback();
            expect(resolve).to.be.eql(4);
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

    it('test multi map + forEach task', (done) => {
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

        a.unsafeRun().then(resolve => {
            expect(resolve).to.be.eql(4);
            done();
        }).catch(error => {
            console.log(error, 'error');
        })
    });
    it('test empty static task', (done) => {
        let a = Task.empty();
        a.unsafeRun()
            .then(success => {
                expect(success).to.be.undefined;
                done();
            });
    });
    it('test reject task', (done) => {
        let a = task((_, reject) => reject('rejected'));
        a.unsafeRun().catch(error => {
            expect(error).to.be.eql('rejected');
            done();
        });
    });

    it('test reject map', (done) => {
        let callback = spy();
        let a = task((_, reject) => reject('rejected'))
            .map((res) => {
                callback();
                res(3)
            });
        a.unsafeRun()
            .catch(error => {
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

        a.unsafeRun()
            .catch(error => {
                expect(error).to.be.eql(2);
                expect(callback.calledOnce).to.be.true;
                done();
            });
    });

    it('test resolver', (done) => {
        let callback = spy();
        task((resolve) => resolve(1))
            .resolve(data => {
                callback();
                expect(data).to.be.eql(1);
            })
            .unsafeRun()
            .then(data => {
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
            .unsafeRun()
            .then(data => {
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
            })
            .map((res, rej, d) => {
                res(d + 1);
            })
            .resolve(data => {
                callback();
                expect(data).to.be.eql(2);
            })
            .unsafeRun()
            .then(data => {
                expect(data).to.be.eql(2);
                expect(callback.calledTwice).to.be.true;
                done();
            });
    });

    it('test complex resolver', async () => {
        let callback = spy();
        let triggerOne = false;
        let triggerTwo = false;
        let a = task((resolve) => resolve(1))
            .resolve(data => {
                callback();
                expect(data).to.be.eql(1);
            });

        let b = a
            .map((res, rej, d) => {
                res(d + 1);
            })
            .resolve(data => {
                if (!triggerOne) {
                    triggerOne = true;
                    expect(callback.calledOnce).to.be.true;
                } else if (!triggerTwo) {
                    triggerTwo = true;
                    expect(callback.calledThrice).to.be.true;
                }
                callback();
                expect(data).to.be.eql(2);

            });
        console.log('\nstart');
        let dataA = await  a.unsafeRun();
        console.log('run 1');
        expect(dataA).to.be.eql(1);
        expect(callback.calledOnce).to.be.true;

        let dataB = await  a.unsafeRun();
        console.log('run 2');
        expect(dataB).to.be.eql(1);
        expect(callback.calledThrice).to.be.true;


        let dataC = await  b.unsafeRun();
        console.log('run 3');
        expect(dataC).to.be.eql(2);
        expect(callback.callCount).to.be.eql(5);
        console.log('finish');
    });

    it('test rejecter', (done) => {
        let callback = spy();
        task((_, reject) => reject(1))
            .reject(data => {
                callback();
                expect(data).to.be.eql(1);
            })
            .unsafeRun()
            .catch(data => {
                expect(data).to.be.eql(1);
                expect(callback.calledOnce).to.be.true;
                done();
            });
    });
    it('test multiple rejecter', (done) => {
        let callback = spy();
        task((resolve, reject) => resolve(1))
            .reject(data => {
                callback();
                expect(data).to.be.eql(1);
            })
            .map((res, rej, d) => {
                rej(d + 1)

            })
            .reject(data => {
                callback();
                expect(data).to.be.eql(2);
            })
            .unsafeRun()
            .catch(data => {
                expect(data).to.be.eql(2);
                expect(callback.calledOnce).to.be.true;
                done();
            });
    });
    it('test copy', async () => {
        let callback = spy();

        let taskA = task({a: 'a', b: 'b'});
        let taskB = taskA.map((res, rej, data) => {
            callback();
            data.c = 'c'
            res(data);
        });

        let taskC = taskB.copy();

        let taskD = taskA.copy();

        let taskE = taskB.map((res, rej, data) => {
            callback();
            data.e = 'e'
            res(data);
        });

        let taskF = taskD.map((res, rej, data) => {
            callback();
            data.d = 'd'
            res(data);
        })

        let dataA = await taskC.unsafeRun()
        expect(dataA).to.be.eql({a: 'a', b: 'b', c: 'c'});
        expect(callback.calledOnce).to.be.true;
        callback();

        let dataB = await  taskF.unsafeRun()
        expect(dataB).to.be.eql({a: 'a', b: 'b', d: 'd'});
        expect(callback.calledThrice).to.be.true;

        let dataC = await  taskE.unsafeRun()
        expect(dataC).to.be.eql({a: 'a', b: 'b', c: 'c', e: 'e'});
        expect(callback.callCount).to.be.eql(5);

    });
    it('test throught', async () => {
        let callback = spy();

        let taskA = task({a: 'a', b: 'b'});
        let taskB = task((res, rej, data) => {
            expect(data).to.be.eql({a: 'a', b: 'b'});
            callback();
            data.c = 'c'
            res(data);
        });
        let taskC = taskA.throught(taskB);
        let dataA = await taskC.unsafeRun();
        expect(dataA).to.be.eql({a: 'a', b: 'b', c: 'c'});
        expect(callback.calledOnce).to.be.true;
    });

    it('test throught complex', async () => {
        let callback = spy();

        let taskA = task({a: 'a', b: 'b'});
        let innerTask = taskA.resolve(data=>{
            callback();
            expect(data).to.be.eql({a: 'a', b: 'b'});
        });

        let taskB = task((res, rej, data) => {
            expect(data).to.be.eql({a: 'a', b: 'b'});
            callback();
            data.c = 'c'
            res(data);
        });

        let taskC = taskA.throught(taskB);

        let dataA = await taskC.unsafeRun();
        expect(dataA).to.be.eql({a: 'a', b: 'b', c: 'c'});
        expect(callback.calledTwice).to.be.true;

        let dataB = await taskA.unsafeRun();
        expect(dataB).to.be.eql({a: 'a', b: 'b'});
        expect(callback.callCount).to.be.eql(4);


        let dataC = await innerTask.unsafeRun();
        expect(dataC).to.be.eql({a: 'a', b: 'b'});
        expect(callback.callCount).to.be.eql(6);

        let dataD = await taskC.unsafeRun();
        expect(dataD).to.be.eql({a: 'a', b: 'b', c: 'c'});
        expect(callback.callCount).to.be.eql(8);

    });


});
