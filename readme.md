## Library for working with pull based async Tasks [![Build Status](https://api.travis-ci.org/gunins/stonewall.svg?branch=master)](https://travis-ci.org/gunins/functional)

! Curently this library is on development stage.

### Why This Library

This library inspired by [**fs2**](https://github.com/functional-streams-for-scala/fs2) Scala Library. Instead of pub sub concept, there introduced pull base concept.
You can pull sequence of tasks, transform them, and returning as promise.

Also, you can combine tasks together. Task reject use [Railway Oriented Programming](http://www.zohaib.me/railway-programming-pattern-in-elixir/).

### Installation

Using npm

    npm install functional_tasks

### How it works

This library usng [**UMD**](https://github.com/umdjs/umd) modules, can be used on nodejs and browser. Also if use es6 modules, can compile from source folder, using [**rollup**](https://github.com/rollup/rollup) or webpack.


### Usage examples


```javascript
    import {Task, task} from 'functional_tasks/src/core/Task';
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
    import {Task, task} from 'functional_tasks/src/core/Task';
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
    import {Task, task} from 'functional_tasks/src/core/Task';

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
    import {Task, task} from 'functional_tasks/src/core/Task';
    
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
    
### Option 
Option represents optional values. usefoul to avoid if else statements.
    
Usage
    
```javascript
    import {some, none} from 'functional_tasks/src/core/Option';
    
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
   import {List, list} from 'functional_tasks/src/core/List';
   let a = list(1,2,3)

```

**new List(...elemnts):**  Create immutable list of elements.
**list(...elemnts):**  Create immutable list of elements without `new`.

**insert(element):** Adding new Element to the beginning of an List.

**add(element):** Adding new Element to the end of an List.

**map(fn):** apply functor to all elements and returning new List

**forEach(fn):** iterate over elements, and returning new List

**flatMap(fn):** Building new Collection by apply functor. **returning value must be a list**

**find(fn):** Returns first matching element in a list

**filter(fn):** Returning new collection with matched criteria.

**size():** Returning Size of List.

**take(count):** Returning count of elements

**foldLeft(init,fn):** Applies function to initialValue and all elements going left to right 

**foldRight(init,fn):** Applies function to initialValue and all elements going right to left

**reverse():** Returning new list in reversing order.

**concat(...lists):** Combining multiple lists.

**copy():** Returning new copy of list.

**isList():** Returning true if is list.

**toArray():** Convert list to Array.

Static

**empty():** Create Empty List.

### Task

Trampolined computation producing an A that may include asynchronous steps. Arbitrary expressions involving `map`.

Usage

```javascript
    import {Task, task} from 'functional_tasks/src/core/Task';
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

### Stream

Streaming IO library. 
The design goal is stream composition, and safe for memory. 
For example, if read stream is faster than write, after some time, you will be out of memory.
Solution is paused mode. Each stream is like task, every time finish, notify chilg with new data. 
If read return data, go step down, if null step up. 
If null is top step, call stop for all stream chain, and finish read and close one by one.
Each step is promise, in any step by returning `reject` you hve error. All streams from top are notified.

Stream lifecycle has 3 steps:
 
- `init` instance creation in constructor.
- `onReady` called every time requesting new data.
- `onData` called after `onReady` finished. For Duplex and Transform streams, `write()` ->`read()`.

Also support for `error` and `stop` 
- `onStop` called, when top instance has no data. (Later will be manual stop call support)
- `onError` called, when on some instance has error. Will notify all pipeline.

Helper methods:

- `map` apply functor on chunk, and pass in to next step.
- `through` chain two or more streams together.
- `throughTask` chain stream pipeline with task pipeline.

All stream steps are lazy. To start stream need to call `.run()` method.
`.run()` and return promise. Success `.then(last context=>...)` Error `.catch(error=>....)`


There is helpers to support Nodejs Streams `writeStream, readStream, duplexStream`. 
For transform streams no need for special type, use `duplexStream`.


### Usage

**for `fs` read and write**

```javascript
    import {stream} from 'functional_tasks/src/core/Stream';
    import {fileReadStream, fileWriteStream} from 'functional_tasks/functional/nodeStreams/fileReader';
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

Example is very basic, but, just show how to use outside Nodejs Streams, for example, readArray, can be Websocket.


**Readable Streams in browser**

```javascript

import {stream} from '../../../src/functional/core/Stream';
import {task} from '../../../src/functional/core/Task';

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
Reason for example is, to show streams in browser.

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

import {readStream} from 'functional/nodeStreams/nodeStreams';

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
