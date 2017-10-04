import {task} from '../core/Task';

const load = async (opt) => {
    const res = await fetch(opt.uri, Object.assign({}, opt, {
        headers: Object.assign({
            'Accept':       'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }, opt && opt.headers ? opt.headers : {})
    }));
    return res.json();
};
const str = obj => Object.keys(obj)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');

const fetchTask = task(opt => load(opt));

const getBase = task(opt => {
    const {protocol, host, uri, body} = opt;
    return Object.assign(
        opt,
        {
            credentials: 'include',
            uri:         (host && protocol ? protocol.replace(':', '') + `://` + host + uri : uri) + (uri.indexOf('?') === -1 && body ? '?' + str(body) : ''),
            body:        undefined
        }
    )
});
const get = getBase.copy()
    .map(opt => Object.assign(
        opt,
        {method: 'get'}
    ))
    .through(fetchTask);

const del = getBase.copy()
    .map(opt => Object.assign(
        opt,
        {method: 'delete'}
    ))
    .through(fetchTask);


const postBase = task(opt => Object.assign(
    {method: 'post'},
    opt,
    {body: JSON.stringify(opt.body || {})})
);
const post = postBase.copy()
    .map(opt => Object.assign(
        opt,
        {method: 'post'}
    ))
    .through(fetchTask);
const put = postBase.copy()
    .map(opt => Object.assign(
        opt,
        {method: 'put'}
    ))
    .through(fetchTask);


export {fetchTask, get, post, del, put}