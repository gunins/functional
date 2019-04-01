import {task, Task} from './dist/functional/core/Task';
import {stream, Stream} from './dist/functional/core/Stream';
import {some, Some, none, None} from './dist/functional/core/Option';
import {list, List} from './dist/functional/core/List';
import {match} from './dist/functional/core/Match';
import {fetchTask, get, post, del, put} from './dist/functional/async/Fetch';
import {fileWriteStream, fileReadStream} from './dist/functional/nodeStreams/fileReader';
import {readStream, writeStream, duplexStream} from './dist/functional/nodeStreams/nodeStreams';

export {
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
}
