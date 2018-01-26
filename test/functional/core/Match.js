const {list} = require('../../../dist/functional/core/List');
const {task} = require('../../../dist/functional/core/Task');
const {some, none} = require('../../../dist/functional/core/Option');
const {match} = require('../../../dist/functional/core/Match');

const {expect} = require('chai');

describe('Tests for Pattern Matching with different types', () => {
    it('Testing Match for List', () => {
        const listMatch = match(list);
        const values = list(1, 2, 'vasja', 3, 4);

        const evenMatch = (num) => !isNaN(num) && num % 2 === 0 ? some(num) : none();
        const oddMatch = (num) => !isNaN(num) && num % 2 !== 0 ? some(num) : none();


        const result = values
            .flatMap(listMatch({
                case: evenMatch,
                '=>': _ => list(_ + `even`)
            }, {
                case: oddMatch,
                '=>': _ => list(_ + `odd`)
            })).toArray();
        expect(result).to.be.eql(['1odd', '2even', 'vasja', '3odd', '4even']);

    });
    it('Testing Match for option', () => {
        const evenMatch = (num) => !isNaN(num) && num % 2 === 0 ? some(num) : none();
        const oddMatch = (num) => !isNaN(num) && num % 2 !== 0 ? some(num) : none();

        const optionMatch = match(none)(
            {
                case: evenMatch,
                '=>': _ => some(_ + `even`)
            },
            {
                case: oddMatch,
                '=>': _ => some(_ + `odd`)
            }
        );

        const evenValue = some(2);
        const oddValue = some(3);
        const notMatch = some('vasja');

        const evenSuccessA = evenValue.flatMap(optionMatch).get();
        expect(evenSuccessA).to.be.eql('2even');

        const evenSuccessB = oddValue.flatMap(optionMatch).get();
        expect(evenSuccessB).to.be.eql('3odd');

        const evenSuccessC = notMatch.flatMap(optionMatch).get();
        expect(evenSuccessC).to.be.undefined;

    });
    it('testing Match for Task', async () => {
        const taskMatch = match(task);
        const evenMatch = (num) => !isNaN(num) && num % 2 === 0 ? some(num) : none();
        const oddMatch = (num) => !isNaN(num) && num % 2 !== 0 ? some(num) : none();

        const result = await task(1)
            .flatMap(taskMatch({
                    case: evenMatch,
                    '=>': _ => task(_ + `even`)
                },
                {
                    case: oddMatch,
                    '=>': _ => task(_ + `odd`)
                }))
            .resolve(_ => expect(_).to.be.eql(`1odd`))
            .map(() => 2)
            .flatMap(taskMatch({
                    case: evenMatch,
                    '=>': _ => task(_ + `even`)
                },
                {
                    case: oddMatch,
                    '=>': _ => task(_ + `odd`)
                }))
            .resolve(_ => expect(_).to.be.eql(`2even`))
            .unsafeRun();
        expect(result).to.be.eql(`2even`)

    });
});