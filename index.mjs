import {task, Task} from './src/functional/core/Task';
import {stream, Stream} from './src/functional/core/Stream';
import {some, Some, none, None} from './src/functional/core/Option';
import {list, List} from './src/functional/core/List';
import {match} from './src/functional/core/Match';
import {fetchTask, get, post, del, put} from './src/functional/async/Fetch';
import {fileWriteStream, fileReadStream} from './src/functional/nodeStreams/fileReader';
import {readStream, writeStream, duplexStream} from './src/functional/nodeStreams/nodeStreams';


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
};
