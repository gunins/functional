import {task} from '../core/Task';

let load = async (opt) => {
        let res = await fetch(opt.uri, Object.assign({}, opt, {
            headers: Object.assign({
                'Accept':       'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }, opt && opt.headers ? opt.headers : {})
        }));
        return res.json();
    },
    str = obj => Object.keys(obj)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&'),

    fetchTask = task(opt => load(opt)),

    getBase = task(opt => {
        let {protocol, host, uri, body} = opt;
        return Object.assign(
            opt,
            {
                uri:  (host && protocol ? protocol.replace(':', '') + `://` + host + uri : uri) + (uri.indexOf('?') === -1 && body ? '?' + str(body) : ''),
                body: undefined
            }
        )
    }),
    get = getBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'get'}
        ))
        .through(fetchTask),

    del = getBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'delete'}
        ))
        .through(fetchTask),


    postBase = task(opt => Object.assign(
        {method: 'post'},
        opt,
        {body: JSON.stringify(opt.body || {})})
    ),
    post = postBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'post'}
        ))
        .through(fetchTask),
    put = postBase.copy()
        .map(opt => Object.assign(
            opt,
            {method: 'put'}
        ))
        .through(fetchTask);


export {fetchTask, get, post, del, put}