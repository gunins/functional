let {Some, None, some, none} = require('../../../dist/functional/core/Option'),
    {expect} = require('chai');
describe('Option Tests: ', () => {
    it('Testing Class Some None', () => {
        let a = new Some(3),
            b = new None(3);
        expect(a.get()).to.be.eql(3);
        expect(a.isSome()).to.be.true;
        expect(!b.get()).to.be.true;
        expect(!b.isSome()).to.be.true;
    });

    it('Testing def some none', () => {
        let a = some(3),
            b = none(3);
        expect(a.get()).to.be.eql(3);
        expect(a.isSome()).to.be.true;
        expect(!b.get()).to.be.true;
        expect(!b.isSome()).to.be.true;
    });

    it('Testing map', () => {
        let a = some(3),
            b = a.map(d => d + 1);
        expect(a.get()).to.be.eql(3);
        expect(b.isSome()).to.be.true;
        expect(b.get()).to.be.eql(4);
        expect(b.isSome()).to.be.true;

        let c = none(3),
            d = c.map(d => d + 1);
        expect(c.get()).to.be.undefined;
        expect(c.isSome()).to.be.false;
        expect(d.get()).to.be.undefined;
        expect(d.isSome()).to.be.false;
    });

    it('Testing flatMap', () => {
        let a = some(3),
            b = a.flatMap(d => some(d + 1));
        expect(a.get()).to.be.eql(3);
        expect(b.isSome()).to.be.true;
        expect(b.get()).to.be.eql(4);
        expect(b.isSome()).to.be.true;

        let c = some(3),
            d = c.flatMap(d => none());
        expect(c.get()).to.be.eql(3);
        expect(c.isSome()).to.be.true;
        expect(d.get()).to.be.undefined;
        expect(d.isSome()).to.be.false;

        let e = none(),
            f = e.flatMap(d => some(3));
        expect(e.get()).to.be.undefined;
        expect(e.isSome()).to.be.false;
        expect(f.get()).to.be.eql(3);
        expect(f.isSome()).to.be.true;
    });

    it('Testing some set returning new instance', () => {
        let a = some(3),
            b = a.set(4);
        expect(a.get()).to.be.eql(3);
        expect(a.isSome()).to.be.true;
        expect(b.get()).to.be.eql(4);
        expect(a !== b).to.be.true;
    });

    it('Testing getOrElse', () => {
        let a = some(3),
            b = none(4);
        expect(a.getOrElse(5) === 3).to.be.true;
        expect(b.getOrElse(5) === 5).to.be.true;
        expect(a.toString() === '[object Some]');
        expect(b.toString() === '[object None]');
    });

    it('Testing isEmpty', () => {
        let a = some(3),
            b = none(4);
        expect(!a.isEmpty()).to.be.true;
        expect(b.isEmpty()).to.be.true;
    });
});
