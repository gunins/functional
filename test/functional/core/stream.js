let {Stream, stream} = require('../../../dist/functional/core/Stream'),
    {task} = require('../../../dist/functional/core/Task'),
    {expect} = require('chai'),
    {spy} = require('sinon');

describe('Stream Tests: ', () => {
    it.only('Stream Constructor', async () => {
        let a = stream(() => {
            return Promise.resolve([1, 2, 3]);
        })
            .onReady((_) => _.shift());

        let b = stream((_) => _ + 1);

        let c = a.through(b);
        let result = [];

        const resp = await c.onData((_, context) => {
            result = [...(context || []), _];
            return result;
        }).run();
        console.log('Response test', resp);
        expect(result).to.be.eql([2, 3, 4]);
        expect(result).to.be.eql(resp);


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
        expect(!tail.tail.tail.isSome()).to.be.true;

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

    it('stream empty, insert, size', async () => {
        let a = Stream.empty();
        let b = a.insert(1);
        let c = b.insert(2);
        let d = b.map(i => i + 3);

        expect(a.size()).to.be.eql(0);
        expect(b.size()).to.be.eql(1);
        expect(c.size()).to.be.eql(2);
        expect(d.size()).to.be.eql(1);


        let testB = [1],
            testC = [2, 1],
            testD = [4];

        expect(await b.toArray()).to.eql(testB);
        expect(await c.toArray()).to.eql(testC);
        expect(await d.toArray()).to.eql(testD)


    });

    it('testing empty, add, size', async () => {
        let a = Stream.empty();
        let b = a.insert(1);
        let c = b.add(2);
        let d = c.add(3);

        expect(a.size()).to.be.eql(0);
        expect(b.size()).to.be.eql(1);
        expect(c.size()).to.be.eql(2);
        expect(d.size()).to.be.eql(3);


        let testB = [1],
            testC = [1, 2],
            testD = [1, 2, 3];

        expect(await b.toArray()).to.eql(testB);
        expect(await c.toArray()).to.eql(testC);
        expect(await d.toArray()).to.eql(testD)

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

    it('testing map method', async () => {
        let a = await stream(task(1), task(2)).map(d => d + 1);

        let {head, tail} = a;
        let headTask = await head.get().unsafeRun();
        expect(headTask).to.be.eql(2);

        let tailTask = await tail.head.get().unsafeRun();
        expect(tailTask).to.be.eql(3);
        expect(!tail.tail.isSome()).to.be.true;
    });

    it('testing flatMap method', async () => {
        let a = await stream(task(1), task(2)).flatMap(d => task(d + 1));

        let headTask = await a.toArray();
        expect(headTask).to.be.eql([2, 3]);

    });

    it('testing toList method, also async tasks', async () => {
        let a = await stream(
            task(1),
            task((d, res) => res(2)),
            (d, res) => setTimeout(() => res(4), 100)
        ).map(d => d + 1);
        let list = await a.toList();
        expect(list.toArray()).to.be.eql([2, 3, 5]);
    });

    it('testing toArray method', async () => {
        let a = await stream(task(1), task(2), 4).map(d => d + 1);
        let array = await a.toArray();
        expect(array).to.be.eql([2, 3, 5]);
    });

    it('testing foldLeft', async () => {
        let a = stream(1, 2, 3);
        let b = await a.foldLeft(6, (a, b) => a + b);
        expect(b).to.eql(12);
        let c = await a.foldLeft((a, b) => (a || 0) + b);
        expect(c).to.eql(6);
    });

    it('testing foldRight', async () => {
        let a = stream(
            'a',
            task((d, res) => res('b')),
            task((d, res) => setTimeout(() => res('c'), 50))
        );
        let b = await a.foldLeft('', (a, b) => a + b);
        let c = await a.foldRight('', (a, b) => a + b);

        expect(b).to.eql('abc');
        expect(c).to.eql('cba');

    });

    it('testing reverse', async () => {
        let a = stream(1, 2, 3);
        let b = a.reverse();
        expect(await b.toArray()).to.eql([3, 2, 1]);
    });

    it('testing concat', async () => {
        let a = stream(1, 2, 3);
        let b = a.concat(stream(4, 'd'), stream(6, 'c'));
        expect(await b.toArray()).to.eql([1, 2, 3, 4, 'd', 6, 'c']);
    });

    it('testing unsafeRun', async () => {
        let cb = spy();
        let a = stream(1, task(2), 3);
        let b = a.map(a => cb());
        await b.unsafeRun();
        expect(cb.callCount).to.be.eql(3)
    });
    it('Testing through', async () => {
        let cb = spy();
        let a = stream(1, task(2), 3);
        let b = task(a => {
            cb();
            return a;
        });
        let c = task(a => a + 1);

        let end = await a.through(b).through(c).toArray();
        expect(cb.callCount).to.be.eql(3);
        expect(end).to.be.eql([2, 3, 4]);
    });

    it('Testing resolve', async () => {
        let cb = spy();
        let a = stream(1, task(2), 3);
        let c = a.resolve(d => cb());

        await c.toArray();
        expect(cb.callCount).to.be.eql(3);
    });


});
