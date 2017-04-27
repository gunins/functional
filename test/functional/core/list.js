let {List, list} = require('../../../dist/functional/core/List'),
    {expect} = require('chai');
describe('List Tests', () => {
    it('Testing List Constructor', () => {
        let a = new List(1, 2, 3);
        let {head, tail} = a;
        expect(head.get() === 1);

        expect(tail.head.get() === 2);

        expect(tail.tail.head.get() === 3);

        expect(!tail.tail.tail.isSome());


    });
    it('testing list, and map and toArray', () => {
        let a = list(1, 2, 3);
        let test = [1, 2, 3];
        let test2 = [2, 3, 4];

        a.map((item, i) => {
            expect(item === test[i]);
        });

        let b = a.map(a => a + 1);
        let bArray = b.toArray();

        expect(Array.isArray(bArray));
        bArray.forEach((item, i) => {
            expect(item === test2[i]);
        })

        let arr = a.toArray();
        expect(Array.isArray(arr));
        arr.forEach((item, i) => {
            expect(item === test[i]);
        })

    });
    it('testing empty, insert', () => {
        let a = List.empty();
        let b = a.insert(1);
        let c = b.insert(2);
        let d = b.map(i => i + 3);
        expect(a.size() === 0);
        expect(b.size() === 1);
        expect(c.size() === 2);
        expect(d.size() === 2);
        let testB = [1],
            testC = [2, 1],
            testD = [4];

        expect(b.toArray()).to.eql(testB);
        expect(c.toArray()).to.eql(testC);
        expect(d.toArray()).to.eql(testD)


    });

    it('testing foldLeft', () => {
        let a = list(1, 2, 3);
        let b = a.foldLeft(6, (a, b) => a + b);
        expect(b).to.eql(12);
        let c = a.foldLeft((a, b) => (a || 0) + b);
        expect(c).to.eql(6);
    });

    it('testing foldRight', () => {
        let a = list('a', 'b', 'c');
        let b = a.foldLeft('', (a, b) => a + b);
        let c = a.foldRight('', (a, b) => a + b);

        expect(b).to.eql('abc');
        expect(c).to.eql('cba');

    });

    it('testing reverse', () => {
        let a = list(1, 2, 3);
        let b = a.reverse();
        expect(b.toArray()).to.eql([3, 2, 1]);
    })

    it('testing concat', () => {
        let a = list(1, 2, 3);
        let b = a.concat(list(4, 'd'), list(6, 'c'));
        expect(b.toArray()).to.eql([1, 2, 3, 4, 'd', 6, 'c']);
    })
    it('testing flatMap', () => {
        let a = list(list(1, 2), list(3, 4), list(5, 6));
        let b = a.flatMap(a => a);
        expect(b.toArray()).to.eql([1, 2, 3, 4, 5, 6]);

    })
});
