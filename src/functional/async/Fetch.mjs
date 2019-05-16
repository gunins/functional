import {task} from '../core/Task.mjs';

const {assign} = Object;

const load = async (opt) => fetch(opt.uri, assign({}, opt, {
    headers: assign({
        'Accept':       'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    }, opt && opt.headers ? opt.headers : {})
}))
    .then(res => res.json());

const str = obj => Object.keys(obj)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    .join('&');

const fetchTask = task(opt => load(opt));

const uriPath = ({protocol, host, uri}) => (host && protocol ? protocol.replace(':', '') + `://` + host + uri : uri);

const getBase = task(opt => {
    const {uri, body} = opt;
    return assign(
        {credentials: 'include'},
        opt,
        {
            uri:  uriPath(opt) + (uri.indexOf('?') === -1 && body ? '?' + str(body) : ''),
            body: undefined
        }
    )
});
const get = getBase.copy()
    .map(opt => assign(
        {method: 'get'},
        opt
    ))
    .through(fetchTask);

const del = getBase.copy()
    .map(opt => assign(
        {method: 'delete'},
        opt
    ))
    .through(fetchTask);


const postBase = task(opt => assign(
    {
        method:      'post',
        credentials: 'include',
    },
    opt,
    {
        body: JSON.stringify(opt.body || {}),
        uri:  uriPath(opt)
    }));

const post = postBase.copy()
    .map(opt => assign(
        opt,
        {method: 'post'}
    ))
    .through(fetchTask);

const put = postBase.copy()
    .map(opt => assign(
        opt,
        {method: 'put'}
    ))
    .through(fetchTask);


export {fetchTask, get, post, del, put}
