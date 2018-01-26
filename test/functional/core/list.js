const {List, list} = require('../../../dist/functional/core/List');
const {expect}     = require('chai');

describe('List Tests: ', () => {
    it('Testing List Constructor', () => {
        let a            = new List(1, 2, 3);
        let {head, tail} = a;
        expect(head.get()).to.be.eql(1);

        expect(tail.head.get()).to.be.eql(2);

        expect(tail.tail.head.get()).to.be.eql(3);

        expect(!tail.tail.tail.isSome()).to.be.true;

    });
    it('testing list, and map and toArray', () => {
        let a     = list(1, 2, 3);
        let test  = [1, 2, 3];
        let test2 = [2, 3, 4];

        a.map((item, i) => {
            expect(item === test[i]);
        });

        let b      = a.map(a => a + 1);
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
    it('testing empty, insert, size', () => {
        let a = List.empty();
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

        expect(b.toArray()).to.eql(testB);
        expect(c.toArray()).to.eql(testC);
        expect(d.toArray()).to.eql(testD)

    });

    it('testing empty, add, size', () => {
        let a = List.empty();
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
    });

    it('testing concat', () => {
        let a = list(1, 2, 3);
        let b = a.concat(list(4, 'd'), list(6, 'c'));
        expect(b.toArray()).to.eql([1, 2, 3, 4, 'd', 6, 'c']);
    });
    it('testing flatMap', () => {
        let a = list(list(1, 2), list(3, 4), list(5, 6));
        let b = a.flatMap(a => a);
        expect(b.toArray()).to.eql([1, 2, 3, 4, 5, 6]);

    })
    it('testing find', () => {
        let a     = list(1, 2, 3);
        let value = a.find(v => v === 2);
        expect(value).to.be.eql(2);
        let c      = list(1, 2, 3, 3, 3, 3);
        let i      = 0;
        let valueB = c.find(v => {
            i++;
            return v === 3;
        });
        expect(valueB).to.be.eql(3);
        expect(i).to.be.eql(3);
    });
    it('testing find', () => {
        let a     = list(1, 2, 3);
        let value = a.filter(v => v >= 2);
        expect(value.toArray()).to.be.eql([2, 3]);
        let c      = list(1, 2, 3, 3, 3);
        let valueB = c.filter(v => v === 3);
        expect(valueB.toArray()).to.be.eql([3, 3, 3]);
    });

    it('testing take', () => {
        let a     = list(1, 2, 3);
        let value = a.take(2);
        expect(value.toArray()).to.be.eql([1, 2]);

        let valueB = a.take(1);
        expect(valueB.toArray()).to.be.eql([1]);
        let c      = list(1, 2, 3, 3, 3);
        let valueC = c.take(3);
        expect(valueC.toArray()).to.be.eql([1, 2, 3]);
    });
});
