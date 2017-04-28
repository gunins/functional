let {Some, None, some, none} = require('../../../dist/functional/core/Option'),
    {expect} = require('chai');
describe('Option Tests: ', () => {
    it('Testing Class Some None', () => {
        let a = new Some(3),
            b = new None(3);
        expect(a.get() === 3);
        expect(a.isSome());
        expect(!b.get());
        expect(!b.isSome());
    });

    it('Testing def some none', () => {
        let a = some(3),
            b = none(3);
        expect(a.get() === 3);
        expect(a.isSome());
        expect(!b.get());
        expect(!b.isSome());
    });

    it('Testing some set returning new instance', () => {
        let a = some(3),
            b = a.set(4);
        expect(a.get() === 3);
        expect(a.isSome());
        expect(b.get() === 4);
        expect(a !== b);
    });

    it('Testing getOrElse', () => {
        let a = some(3),
            b = none(4);
        expect(a.getOrElse(5) === 3);
        expect(b.getOrElse(5) === 5);
        expect(a.toString() === '[object Some]');
        expect(b.toString() === '[object None]');
    });

    it('Testing isEmpty', () => {
        let a = some(3),
            b = none(4);
        expect(!a.isEmpty());
        expect(b.isEmpty());
    });
});
