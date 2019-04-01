const {task, Task} = require('./dist/functional/core/Task');
const {stream, Stream} = require('./dist/functional/core/Stream');
const {some, Some, none, None} = require('./dist/functional/core/Option');
const {list, List} = require('./dist/functional/core/List');
const {match} = require('./dist/functional/core/Match');
const {fetchTask, get, post, del, put} = require('./dist/functional/async/Fetch');


module.exports = {
    task,
    Task,
    stream,
    Stream,
    some,
    Some,
    none,
    None,
    list,
    List,
    match,
    fetchTask,
    get,
    post,
    del,
    put
};
