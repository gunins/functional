let fetchMock = require('fetch-mock'),
    {fetchTask, get, post, del, put} = require('../../../dist/functional/async/Fetch'),
    {task} = require('../../../dist/functional/core/Task'),
    {expect} = require('chai'),
    {spy} = require('sinon');
;


describe('Async Fetch Tests', () => {
    it('Testing method "fetch"', async () => {
        fetchMock.get('http://httpbin.org/get', {hello: 'world'});

        let resp = await task({uri: "http://httpbin.org/get"})
            .through(fetchTask).unsafeRun();
        expect(resp).to.be.eql({hello: 'world'});
        fetchMock.restore();
    });

    it('Testing get method', async () => {
        fetchMock.get('http://httpbin.org/get?a=1&b=2', {hello: 'world'});

        let resp = await task({
            protocol: 'http',
            host:     'httpbin.org',
            uri:      '/get'
        })
            .map(opt => Object.assign(opt, {
                body: {a: 1, b: 2}
            }))
            .through(get).unsafeRun();

        expect(resp).to.be.eql({hello: 'world'});

        fetchMock.restore();
    });

    it('Testing del method', async () => {
        fetchMock.delete('http://httpbin.org/del?a=1&b=2', {hello: 'world'});

        let resp = await task({
            protocol: 'http:',
            host:     'httpbin.org',
            uri:      '/del'
        })
            .map(opt => Object.assign(opt, {
                body: {a: 1, b: 2}
            }))
            .through(del).unsafeRun();

        expect(resp).to.be.eql({hello: 'world'});

        fetchMock.restore();
    });

    it('Testing post method', async () => {
        fetchMock.post('http://httpbin.org/get', {hello: 'world'});

        let resp = await task({uri: "http://httpbin.org/get"})
            .map(opt => Object.assign(opt, {
                body: {a: 'a', b: 'b', c: [1, 2, 3]}
            }))
            .through(post).unsafeRun();
        expect(resp).to.be.eql({hello: 'world'});

        fetchMock.restore();
    });
    it('Testing put method', async () => {
        fetchMock.put('http://httpbin.org/get', {hello: 'world'});

        let resp = await task({uri: "http://httpbin.org/get"})
            .map(opt => Object.assign(opt, {
                body: {a: 'a', b: 'b', c: [1, 2, 3]}
            }))
            .through(put).unsafeRun();
        expect(resp).to.be.eql({hello: 'world'});

        fetchMock.restore();
    });

    it('Splitted tasks', async () => {
        fetchMock.get('http://httpbin.org/get?a=1&b=2', {hello: 'world'});

        let base = task({uri: 'http://httpbin.org/get'});

        let setParams = task(opt => Object.assign(opt, {
            body: {a: 1, b: 2}
        }));

        let resp = await task()
            .through(base)
            .through(setParams)
            .through(get)
            .unsafeRun();

        expect(resp).to.be.eql({hello: 'world'});

        fetchMock.restore();

    })
});