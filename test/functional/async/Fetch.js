let {square} = require('../../../dist/functional/async/Fetch'),
    {expect} = require('chai');

describe('Async Fetch Tests', () => {
    it('Testing method "text"', () => {
        expect(square(11) === 121);
    });
});