let {Stream, stream} = require('../../../dist/functional/core/Stream'),
    {task} = require('../../../dist/functional/core/Task'),
    {expect} = require('chai'),
    {spy} = require('sinon');

describe('Stream Tests: ', () => {
    it('Stream Constructor', async () => {
        let a = new Stream(1, task({a: 2}), {b: 3});
        let {head, tail} = a;
        let headTask = await head.get().unsafeRun();
        expect(headTask).to.be.eql(1);

        let tailTask = await tail.head.get().unsafeRun();
        expect(tailTask).to.be.eql({a: 2});

        let lastTask = await tail.tail.head.get().unsafeRun();
        expect(lastTask).to.be.eql({b: 3});
        expect(!tail.tail.tail.isSome());

    });
    it('stream function', async () => {
        let a = stream(task(1).map(a => a + 1), task({a: 2}), {b: 3});
        let {head, tail} = a;
        let headTask = await head.get().unsafeRun();
        expect(headTask).to.be.eql(2);

        let tailTask = await tail.head.get().unsafeRun();
        expect(tailTask).to.be.eql({a: 2});

        let lastTask = await tail.tail.head.get().unsafeRun();
        expect(lastTask).to.be.eql({b: 3});
        expect(!tail.tail.tail.isSome());

    });
    it('stream Insert method', async () => {
        let a = stream(task(1));
        let b = a.insert(task(2));
        let headTaskA = await a.head.get().unsafeRun();
        expect(headTaskA).to.be.eql(1);

        let {head, tail} = b;

        let headTaskB = await head.get().unsafeRun();
        expect(headTaskB).to.be.eql(2);

        let tailTask = await tail.head.get().unsafeRun();
        expect(tailTask).to.be.eql(1);
    });

    it('stream copy method', async () => {
        let initial = stream(task(1).map(a => a + 1), task({a: 2}), {b: 3});

        let a = initial.copy();

        let {head, tail} = a;
        let headTask = await head.get().unsafeRun();
        expect(headTask).to.be.eql(2);

        let tailTask = await tail.head.get().unsafeRun();
        expect(tailTask).to.be.eql({a: 2});

        let lastTask = await tail.tail.head.get().unsafeRun();
        expect(lastTask).to.be.eql({b: 3});
        expect(!tail.tail.tail.isSome());


        let headTaskInit = await initial.head.get().unsafeRun();
        expect(headTaskInit).to.be.eql(2);

        let tailTaskinit = await initial.tail.head.get().unsafeRun();
        expect(tailTaskinit).to.be.eql({a: 2});

        let lastTaskInit = await initial.tail.tail.head.get().unsafeRun();
        expect(lastTaskInit).to.be.eql({b: 3});
        expect(!tail.tail.tail.isSome());

        let headTaskB = await head.get().unsafeRun();
        expect(headTaskB).to.be.eql(2);

        let tailTaskB = await tail.head.get().unsafeRun();
        expect(tailTaskB).to.be.eql({a: 2});

        let lastTaskB = await tail.tail.head.get().unsafeRun();
        expect(lastTaskB).to.be.eql({b: 3});
        expect(!tail.tail.tail.isSome());

    });

    it.only('testing map method', async ()=>{

    });

});