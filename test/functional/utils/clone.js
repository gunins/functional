let {clone, isSimple, isDate, isArray, isObject} = require('../../../dist/functional/utils/clone'),
    {expect} = require('chai');
describe('Clone Tests', () => {
    describe('Testing guards', () => {
        expect(isObject({a: 1})).to.be.true;
        expect(isArray([1, 2, 3])).to.be.true;
        expect(isDate(new Date())).to.be.true;
        expect(isSimple('string')).to.be.true;
        expect(isSimple(1)).to.be.true;
        expect(isSimple(true)).to.be.true;

    });

    it('CloneSimple', () => {
        expect(clone(1)).to.be.eql(1);
        expect(clone('string')).to.be.eql('string');
        expect(clone(false)).to.be.eql(false);
        expect(clone(new Date(1510740672425))).to.be.eql(new Date(1510740672425));
    });

    it('Clone Array', () => {
        let test = [1, 2, 3];
        let cloned = clone(test);
        expect(cloned).to.be.eql(test);
        test.splice(0, 1);
        expect(cloned).not.to.be.eql(test);
        expect(cloned).to.be.eql([1, 2, 3]);
    });
    it('Clone Objects', () => {
        let a = {
                fn:   (a, b) => a + b,
                date: new Date(),
                a:    'a',
                b:    'b',
                c:    [1, 2, 3],
                d:    false,
                e:    [{f: 'f', g: 'g'}, {f: 'f1', g: 'g1'}]
            },
            b = clone(a);
        expect(b).to.be.deep.eql(a);

    });


});