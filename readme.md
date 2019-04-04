## async Stream and Task library [![Build Status](https://api.travis-ci.org/gunins/stonewall.svg?branch=master)](https://travis-ci.org/gunins/functional)

! Curently this library is on development stage.

### Why This Library

I/O in node is asynchronous, so interacting with the disk and network involves passing callbacks to functions. 
As streams are EventEmitters, they emit several events at various points.

One way to read data from a stream is to listen to data event and attach a callback. When a chunk of data is 
available, the readable stream emits a data event and your callback executes. Take a look at the following snippet:

```javascript

    import {createReadStream} from 'fs';
    const readableStream = createReadStream('file.txt');
    let chunks = Buffer.alloc(0);
    
    readableStream.on('data', (chunk)=> {
        chunks = Buffer.concat([chunks, chunk]);
    });
    
    readableStream.on('end', ()=> {
        console.log(data.toString('utf8'));
    });

```

In this example is very easy, you read file and store in to `Buffer`.

And if you want to chain streams together, there is one easy way.


```javascript
import fs from 'fs';
import zlib from 'zlib';

fs.createReadStream('input.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('output.txt'));

```

Very simple, and easy. But sometimes, if read is faster than write, after some time you are out of memory.

Solution is, paused mode.

```javascript

    import {createReadStream, createWriteStream} from 'fs';
    const srcStream = createReadStream('file.txt');
    const destStream = createWriteStream('output.txt')

   
    srcStream.on('data', (chunk)=> {
        const canContinue = destStream.write(chunk);
          if (!canContinue) {
            // we are overflowing the destination, we should pause
            srcStream.pause();
            // we will resume when the destination stream is drained
            destStream.once('drain', () => srcStream.resume());
          }    
    });
    
    srcStream.on('end', ()=> {
        destStream.destroy();
    });

```

This solution is safe, but what if you want to compose streams, and transformations. Means for each pipe, you have to create
stream with some type (readable, writable, transform or duplex).

Here is motivation, we need something else, to make things simpler. This library works in paused mode, is composable, and lazy.

Basic example, transform readable stream to uppercase, and write to destination on the fly.


```javascript
    import {fileReadStream, fileWriteStream} from 'functional_tasks';
        fileReadStream('./file.txt')
                .map(chunk => chunk.toString('utf8'))
                .map(string => string.toUpperCase())
                .through(fileWriteStream('./destination.txt'))
                .run()
    

```

In this example, we read buffer chunk, convert to `utf8` string, convert to UpperCase, and write to destination.
After pipeline is created, we start stream by calling `.run()`. And `run()` will return promise. 

Stream composition is very simple, you can chain them on the fly.


```javascript
    import {stream, fileReadStream, fileWriteStream} from 'functional_tasks';
        const toUpperCase = stream()
            .map(chunk => chunk.toString('utf8'))
            .map(string => string.toUpperCase())
        
        fileReadStream('./fileA.txt')
                .through(toUpperCase)
                .through(fileWriteStream('./destinationA.txt'))
                .run();
        
                fileReadStream('./fileB.txt')
                                .through(toUpperCase)
                                .through(fileWriteStream('./destinationB.txt'))
                                .run();
    

```

You can use `Promise.all` to wait until both streams are finished.


```javascript
    import {stream, fileReadStream, fileWriteStream} from 'functional_tasks';
        const toUpperCase = stream()
            .map(chunk => chunk.toString('utf8'))
            .map(string => string.toUpperCase())
        
        const streamA = fileReadStream('./fileA.txt')
                .through(toUpperCase)
                .through(fileWriteStream('./destinationA.txt'));
        
        const streamB = fileReadStream('./fileB.txt')
                                .through(toUpperCase)
                                .through(fileWriteStream('./destinationB.txt'));
        
        await Promise.all([streamA.run(), streamB.run()])
    

```


Also you can add extra steps, on the same streams

```javascript

    import {stream, fileReadStream, fileWriteStream} from 'functional_tasks';
        const toUpperCase = stream()
            .map(chunk => chunk.toString('utf8'))
            .map(string => string.toUpperCase())
        
       fileReadStream('./fileA.txt')
                .through(toUpperCase)
                .map(string=>string.replace('_','-'))
                .through(fileWriteStream('./destinationA.txt'))
                .run();

``` 


Sometimes you need transformations in asynchronous way. Like fetch remote data, or collect data from database etc.

Solution is `Tasks`.

From example above you want to change string tu uppercase, but file is in memory.

```javascript

  import {task} from 'functional_tasks';
        const toUpperCase = await task('lorem impsum')
            .map(string => string.toUpperCase())
            .unsafeRun();
            console.log(toUpperCase) //LOREM IPSUM
            

``` 

This is very simple use case, lets fetch remote data, and convert to upperCase.

```javascript

import {get} from './functional/async/Fetch';
import {task} from './functional/core/Task';

    const toUpperCase = await task({uri: './textData'})
        .through(get)
        .map(({data})=>data.toUpperCase())
        .unsafeRun();
    console.log(toUpperCase) //LOREM IPSUM

```

All tasks are composable. There is `async` helper library available, for `get`, `post`, `delete` etc.


Our streams, has task support too, with `.throughTask` method.

```javascript

    import {task, fileReadStream, fileWriteStream} from 'functional_tasks';
        const toUpperCase = task()
            .map(chunk => chunk.toString('utf8'))
            .map(string => string.toUpperCase())
        
       fileReadStream('./fileA.txt')
                .throughTask(toUpperCase)
                .map(string=>string.replace('_','-'))
                .through(fileWriteStream('./destinationA.txt'))
                .run();

``` 

You can see many benefits, to use them, when you need file or object transformation pipelines.
Streams and Tasks are fully asynchronous.  


### Installation

Using npm

    npm install functional_tasks


### Usage examples

you can import directly from package.

```javascript

import functional_tasks from 'functional_tasks';

```

Old way.

```javascript

const {Task, task} = require('functional_tasks');


```

Or, just individual modules.

```javascript

import {Task, task} from 'functional_tasks/src/core/Task';

```


```javascript
    import {Task, task} from 'functional_tasks';
    //Initialse task
    // Ignore first param, because, task is only initialised, call resolve, with number 3
      let a = task((_, resolve, reject) => resolve(3))
      //next step, applying new functor, taking data from previous task, and call resolve, by adding 1 to prev data.
            .map((data, resolve) => {
                // add 1 for 3
                resolve(data + 1)
            });
           // Until now, all tasks, waiting for execution. 
           //By calling `unsafeRun()` all tasks are executed, and returning Promise, with result.
            a.unsafeRun()
            .then(data => {
                // data returning value 4
            }).catch(e=>{
                // catch taiking errors, all error use [Railway Oriented Programming](http://www.zohaib.me/railway-programming-pattern-in-elixir/).
            });


```
Using async es6 functions
    
```javascript
    import {Task, task} from 'functional_tasks';
    async ()=>{
    //Initial task
      let a = task((resolve) => resolve(3))
      //apply functor to next step. All data is imutable
            .map((d, res) => {
                res(d + 1)
            });
           // get result
       let data = await a.unsafeRun();
       
       //use data and eql 4
       console.log(data)
    }

```
Combining Tasks

```javascript
    import {Task, task} from 'functional_tasks';

   let taskA = task({a: 'a', b: 'b'});
   let taskB = task((data, res) => {
            data.c = 'c'
            res(data);
        });

   let taskC = taskA.throught(taskB);
   
   let dataA = await taskC.unsafeRun()
   .then(data=>{
        //data should be {a: 'a', b: 'b', c: 'c'}
   });

```
Subscribe for changes using resolve and reject

```javascript
    import {Task, task} from 'functional_tasks';
    
    task((_, resolve) => resolve(1))
            .resolve(data => {
            //every time somewhere called unsafeRun, data triggers and be eql 1
            })
            .unsafeRun()
         
            
    task((_, resolve, reject) => reject(1))
            .reject(data => {
                //data with rejection eql 1
            })
            .unsafeRun()
            .catch(data => {
                //also there return rejection
            });


```
    
## API

### Task

Trampolined computation producing an A that may include asynchronous steps. Arbitrary expressions involving `map`.

Usage

```javascript
    import {Task, task} from 'functional_tasks';
    //Initial task
      let a = task((_, resolve, reject) => resolve(3))
      //apply functor to next step. All data is imutable
            .map((data, resolve, reject) => {
                //
                resolve(data + 1)
            });
           // get result
            a.unsafeRun()
            .then(data => {
                // use data and data to be eql 2
            });


```

**new Task(fn|obj|value):**  Create task and taking Function or object or any simple value. 
**task(fn|obj|value):** create task, without new operator.

Function taking following params, data as result, from previous task, and resolve, reject methods. 
If you not use resolve or reject, You have to return value, and value will be treated as resolve.

Reject will use [Railway Oriented Programming](http://www.zohaib.me/railway-programming-pattern-in-elixir/).

```javascript
    (data, resolve, reject) => {
    // data is returning data from previous task;
    // resolve called, when async task is finished
    // reject called if error
        resolve(data + 1)
    }    

```
synchronous functions no need extra params, and will take return value. 

```javascript
    (data) => {
    // data is returning data from previous task;
     return (data + 1)
    }    

```
  
**copy():** Returns new task, of copy of sequence with all steps.

**map(fn):** Returning new task, with applied functor

**flatMap(fn):** apply functor and must return new task

**through(Task):** adding another task in sequence

**resolve(fn):** subscribe on success with certain step.

**reject(fn):** subscribe on error with certain step.

**clear():** clear subscribtions from certain step.

**isTask():** return if is task

**unsafeRun(resolve,reject):** run task and returning promise as end result.

Static methods

**empty():** Create empty task



### Async Fetch

Tasks for fetch API 

Example 

```javascript
import {get} from './functional/async/Fetch';
import {task} from './functional/core/Task';

    let getData = task({uri: './package'})
        .through(get)
        .unsafeRun().then(data=>console.log(data));

```

ES6 async example

```javascript
import {get} from './functional/async/Fetch';
import {task} from './functional/core/Task';
(async () => {
    let getData = await task({uri: './package'})
        .through(get)
        .unsafeRun();
    console.log(getData);
})()

```

Example.

```javascript
import {get} from './functional/async/Fetch';
import {task} from './functional/core/Task';
(async () => {
    let getData = await task({uri: './package', body:{a:1, b:2}})
        .through(get)
        .unsafeRun();
    console.log(getData);
})()

```

Post example.

```javascript
import {post} from './functional/async/Fetch';
import {task} from './functional/core/Task';
(async () => {
    let getData = await task({uri: './package', body:{a:1, b:2}})
        .through(post)
        .unsafeRun();
    console.log(getData);
})()

```
There also available put and delete.

Example, to combining tasks, with post


```javascript
import {post} from './functional/async/Fetch';
import {task} from './functional/core/Task';
(async () => {
    let base =  task({uri: './package'}); 
    
    let setParams =  task(opt => Object.assign(opt, {
                      body: {a: 1, b: 2}
                  }));
    
    let getData = await task()
                    .through(base)
                    .through(setParams)
                    .through(post)
                    .unsafeRun();
    
    console.log(getData);
})()

```

### Stream

Streaming IO library. 
The design goal is stream composition, and safe for memory. 
For example, if read stream is faster than write, after some time, you will be out of memory.
Solution is paused mode. Each stream is like task, every time finish, notify child with new data. 
If read return data, go step down, if null step up. 
If null is top instance, full stream pipeline will call call stop, finish read and close one by one.
Each step is promise, in any step by returning `reject` you have error. All streams from top are notified, and you can safely close, all streams.

Stream lifecycle has 3 steps:
 
- `init` instance creation in constructor.
- `onReady` called every time requesting new data.
- `onData` called after `onReady` finished. For Duplex and Transform streams, `write()` ->`read()`.

For `error` and `stop` 
- `onStop` called, when top instance has no data. (Later will be manual stop call support)
- `onError` called, when on some instance has error. Error has to return `Promise.reject()`

Helper methods:

- `map` apply functor on chunk, and pass in to next step.
- `through` chain two or more streams together.
- `throughTask` chain stream pipeline with task pipeline.

All stream steps are lazy. To start stream need to call `.run()` method.
`.run()` will return a promise. Success `.then(last context=>...)` error `.catch(error=>....)`


There is helpers to support Nodejs Streams `writeStream, readStream, duplexStream`. 
For transform streams no need for special type, use `duplexStream`.


### Usage

**for `fs` read and write**

```javascript
    import {stream, fileReadStream, fileWriteStream} from 'functional_tasks';
    const source = path.resolve('./test/functional/core/data/emojilist.txt');
    const destination = path.resolve(tmpDir, './emojilistUppper.txt');

         const fileStream = fileReadStream(source)
                .map(chunk => chunk.toString('utf8'))
                .map(string => string.toUpperCase())
                .through(fileWriteStream(destination));
    
             fileStream.run()
                .then(()=>{
                     console.log('stream finished')
                })
                .catch((error)=>{
                    console.error('Stream Error', error) 
                });


```

In example, we read the file, convert `Buffer` to `utf8` string and convert to UpperCase, then save to new target file.
Each new chunk only available, when file finish write.

**Simple Array manipulation**

```javascript

    const readArray = stream(() => {
        return [1, 2, 3, 4, 5, 6];
    })
        .onReady((_) => {
            return _.shift();
        })
    
    
    
    const pairArray = stream(() => {
        let a = [];
        return (_) =>{
                const data = [...a, _];
                a = data.length === 2 ? [] : data;
                return data.length === 2 ? data : null;
    
            }
    }).onReady((instance, _) => {
        return instance(_);
    });
    
    
    const resp = await readArray.through(pairArray)
        .onData((_, context) => {
        return [...(context || []), _];
    })
        .run();
    //resp = [[1,2],[3,4],[5,6]]

```

Simple javascript example, where you can convert simple to pair array. 

There is two streams, first shifting aray, and return each item, second split to pairs. Third collecting data.

This example show how to use outside Nodejs Streams, and can be useful in browser, for example, `readArray` can be Websocket.


**Readable Streams in browser**

```javascript

import {stream, task} from 'functional_tasks';

const image = document.getElementById('target');

const closure = (a, b) => () => {
    let instance;
    const c = a((_) => {
        instance = b(_);
    });
    return instance(c)
};

const setController = (controller) => (_) => ({
    push(value) {
        controller.enqueue(value);
        return _;
    },
    close() {
        controller.close();
        return _
    }
});

const setReadableStream = (cb) => new ReadableStream({
    start(controller) {
        cb(controller);
    }
});

const controllerInstance = closure(setReadableStream, setController);

const readerStream = (rs) => stream(() => rs.getReader())
    .onReady(async reader => {
        const {done, value} = await reader.read();
        return done ? null : value;
    })
    .onStop(reader => {
        reader.releaseLock();
    });

const writeStream = stream(() => controllerInstance())
    .onReady((controller, context) => controller.push(context))
    .onStop((controller) => controller.close());



const imageReadStream = (rs) => readerStream(rs)
    .through(writeStream)
    .run();

task({uri: './tortoise.png'})
    .map(({uri}) => fetch(uri))
    .map(({body}) => imageReadStream(body))
    // Create a new response out of the stream
    .map(rs => new Response(rs))
    // Create an object URL for the response
    .map(response => response.blob())
    .map(blob => URL.createObjectURL(blob))
    // Update image
    .map(url => {
        image.src = url
    })
    .unsafeRun();

```

There is example, how to read Images as streams. to using this, need latest browsers. 

More examples are available in `examples` directory.


**new Stream(instance||Functor):**  Stream Constructor. 

if onReady are not defined, then, `Functor` as argument giving chunk, from parent stream. Same like you use `stream().map()`
```javascript
    (chunk) => {
    // data is returning data from parent stream;
    // Promise.reject call if error
        return chunk + 1
    }    

```

For instance you can give for example;

```javascript

 const readArray = stream(() => {
        return [1, 2, 3, 4, 5, 6];
    })
        .onReady((_) => {
            return _.shift();
        })

```

For nodejs file system.

```javascript

import {
    createReadStream
} from 'fs';

import {readStream} from 'functional_tasks';

const src = ...

const fileReadStream = readStream(createReadStream(src));

```

**onReady(callback):** Giving callback, to call any time child stream is ready. 
Callback taking two arguments, Stream instance and data from parent stream.
As return type taking Promise or any value. `null` will notify stream end.

**onData(callback):** Giving callback, to call after onReady done. For example, when write is finished, and can read.
Callback taking three arguments, data from previous step, previous data and current stream instance. 
As return type taking Promise or any value. `null` will notify stream end.

**onStop(callback)** Giving callback, on stream stop. 
Callback taking two arguments, Stream instance and last data from parent stream.

**onError(callback)** Giving callback, on stream stop. 
Callback three arguments, Stream instance, last data from parent stream, and error.

**copy():** Returns new Stream, of copy of sequence with all steps.

**map(fn):** Returning new stream with applied functor for all tasks.

**through(Stream):** Returning new stream by adding Stream on tail.

**throughTask(Task):** Returning new stream by adding task pipeline on tail.

**isStream():Boolean** return if is Stream


**run():Promise** run tasks and returning Promise as end result, resolve o stream finish.

Static methods

**empty():** Create empty Stream

### NodeStreams

Because this library is made mainly for Nodejs streams, there is transformers, for nodejs streams.

`writeStream, readStream, duplexStream`

**Example**


```javascript

import {
    createReadStream,
    createWriteStream
} from 'fs';

import {createGzip} from 'zlib';

import {readStream, writeStream, duplexStream} from 'functional_tasks';

const fileReadStream = (src, size) => readStream(createReadStream(src), size);

const fileWriteStream = (src, encoding = 'utf8') => writeStream(createWriteStream(src, encoding));

const zip = duplexStream(createGzip())

await fileReadStream(srcFile)
    .through(zip)
    .through(fileWriteStream(targetFile))
    .run();

```

There is example how to read source file, zip  and write to destination.

There convert to upperCase.

```javascript

await fileReadStream(srcFile)
    .map(_ => _.toString('utf8'))
    .map(_ => _.toUpperCase())
    .map(_ => Buffer.from(_, 'utf8'))   
    .through(zip)
    .through(fileWriteStream(targetFile))
    .run();

```

Compose streams together.

```javascript

const toUppercase = stream()   
    .map(_ => _.toString('utf8'))
    .map(_ => _.toUpperCase())
    .map(_ => Buffer.from(_, 'utf8'));

await fileReadStream(srcFile)
    .through(toUppercase)
    .through(zip)
    .through(fileWriteStream(targetFile))
    .run();


```

Compose streams and tasks


```javascript

const toUppercase = task()   
    .map(_ => _.toString('utf8'))
    .map(_ => _.toUpperCase())
    .map(_ => Buffer.from(_, 'utf8'));

await fileReadStream(srcFile)
    .throughTask(toUppercase)
    .through(zip)
    .through(fileWriteStream(targetFile))
    .run();


```

### File Reader

In library already have `{fileReadStream, fileWriteStream}`

You can import and use them directly.

```javascript
import {fileReadStream, fileWriteStream} from 'functional_tasks';

```

## Functional helpers
    
### Maybe 
Maybe represents optional values. 
    
Usage
    
```javascript
    import {some, none} from 'functional_tasks';
    
    some(/*some value*/)
    none() //has no Value

```
    
**new Some(@value):** Returns Option with some value

**new None():** Returns Option with no value  

**some(@value):** Returns Option with some value without `new` 

**none():** Returns Option with no value without `new` 

**some(@value).get()** Returning value   

**(some(@value)|none()).getOrElse(@defaultValue)** Returning value if is Some, else use default Value;

**(some(@value)|none()).isSome()** Returning true if `some` false is `none`

**(some(@value)|none()).map()** Building new option by applying functor.

**(some(@value)|none()).flatMap()** Building new option by applying functor  **returning value must be a Option**
 
### List
 
A class for immutable linked lists representing ordered collections of elements.

Possible side effects, not use lists for large collections.

Usage
    
```javascript
   import {List, list} from 'functional_tasks';
   let a = list(1,2,3)

```

**new List(...elements):**  Create immutable list of elements.

**list(...elements):**  Create immutable list of elements without `new`.

**insert(element):** Adding new Element to the beginning of an List.

**add(element):** Adding new Element to the end of an List.

**map(fn):** apply functor to all elements and returning new List

**forEach(fn):** iterate over elements, and returning new List

**flatMap(fn):** Building new Collection by apply functor. **returning value must be a list**

**find(fn):** Returns first matching element in a list

**filter(fn):** Returning new collection with matched criteria.

**size():** Returning Size of List.

**take(count):** Returning count of elements

**foldLeft(acc,fn):** Applies function to initialValue and all elements going left to right 

**foldRight(acc,fn):** Applies function to initialValue and all elements going right to left

**reverse():** Returning new list in reversing order.

**concat(...lists):** Combining multiple lists.

**copy():** Returning new copy of list.

**isList():** Returning true if is list.

**toArray():** Convert list to Array.

Static

**empty():** Create Empty List.


### Match

Pattern Matching helper.

Example for list 

```javascript
    // define list type to default return
     const listMatch = match(list);
        const values = list(1, 2, 'vasja', 3, 4);
        // define patterns needed for matching, return has to be an Option    
        const evenMatch = (num) => !isNaN(num) && num % 2 === 0 ? some(num) : none();
        const oddMatch = (num) => !isNaN(num) && num % 2 !== 0 ? some(num) : none();


        const result = values
            .flatMap(listMatch({
                case: evenMatch,
                // define function particular pattern. Function has to return same type, which one you define on match initialisation.
                '=>': _ => list(_ + `even`)
            }, {
                case: oddMatch,
                '=>': _ => list(_ + `odd`)
            })).toArray();
        
        //result wil be ['1odd', '2even', 'vasja', '3odd', '4even']

```

Example for Task

```javascript
        // define task type for default return
        const taskMatch = match(task);
        // define patterns needed for matching    
        const evenMatch = (num) => !isNaN(num) && num % 2 === 0 ? some(num) : none();
        const oddMatch = (num) => !isNaN(num) && num % 2 !== 0 ? some(num) : none();

        const result = await task(1)
            .flatMap(taskMatch({
                    case: evenMatch,
                    // define function particular pattern. Function has to return same type, which one you define on match initialisation.
                    '=>': _ => task(_ + `even`)
                },
                {
                    case: oddMatch,
                    '=>': _ => task(_ + `odd`)
                }))
            .resolve(res =>res /*res should be `1odd`*/)
            .map(() => 2)
            .flatMap(taskMatch({
                    case: evenMatch,
                    '=>': _ => task(_ + `even`)
                },
                {
                    case: oddMatch,
                    '=>': _ => task(_ + `odd`)
                }))
            .resolve(res =>res /*res should be `2even`*/)
            .unsafeRun();
        
       // expect result will be `2even`

```
**Type = List|Option|Task ...**

**match(Type)(...{case:()=> Option, '=>':()=>Type}):** create match functor, with returning type, 
and returning function will take an objects with patterns and functions. First matching pattern, will be applied, the rest ignored.
If no match, will return initial value with applied type. 


