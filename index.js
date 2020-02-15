const {task, Task} = require('./dist/functional/core/Task');
const {stream, Stream} = require('./dist/functional/core/Stream');
const {some, Some, none, None} = require('./dist/functional/core/Maybe');
const {list, List} = require('./dist/functional/core/List');
const {match} = require('./dist/functional/core/Match');
const {fetchTask, get, post, del, put} = require('./dist/functional/async/Fetch');
const {fileWriteStream, fileReadStream} = require('./dist/functional/nodeStreams/fileReader');
const {readStream, writeStream, duplexStream} = require('./dist/functional/nodeStreams/nodeStreams');


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
    put,
    fileWriteStream,
    fileReadStream,
    readStream,
    writeStream,
    duplexStream
};
