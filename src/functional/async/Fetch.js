import {task} from '../core/Task';
let load = async (opt) => {
        let res = await fetch(opt.uri, Object.assign({
            headers: {
                'Accept':                      'application/json, text/plain, */*',
                'Content-Type':                'application/json'
            }
        }, opt));
        return res.json();
    },
    str = obj => Object.keys(obj)
        .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&'),

    fetchTask = task(opt => load(opt)),

    getBase = task(opt => Object.assign(
        opt,
        {
            uri:  opt.uri + (opt.body ? '?' + str(opt.body) : ''),
            body: undefined
        }
    )),
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