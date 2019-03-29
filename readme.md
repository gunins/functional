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

Streaming IO library. There is helpers to support Nodejs Streams
The design goal is stream composition, and pull based. All streams is in paused mode.
Only send signal to parent stream, when  step is finished. Everything is promise based.


Usage

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
Each new chunk only available, when file finish write. Reader is in pause mode.

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

Simple javascript example, where you can pair array. 
Two streams, first shifting aray, and return each item, second split to pairs. Third collecting data.

Example is very basic, but, just show the use case, for example, readArray, can be Websocket.



**new Stream(instance||Functor):**  Create Stream with sequence. 

if onReady are not defined, then, `Functor` as argument giving chunk, from parent stream. Same like you use `stream().map()`
```javascript
    (chunk) => {
    // data is returning data from parent stream;
    // Promise.reject call if error
        return chunk + 1
    }    

```

For instance you can give for example 

**insert(task):** Adding new Task to the beginning of an Stream.
  
**add(task):** Adding new Task to the end of an Stream.

**copy():** Returns new Stream, of copy of sequence with all steps.

**map(fn):** Returning new stream with applied functor for all tasks.

**through(Task):** Returning new stream adding another task in each task

**resolve(fn):**  Returning new stream adding subscribe on each task.

**reject(fn):**  Returning new stream  adding error on each task.

**isStream():** return if is Stream

**reverse()** Changing compilation order for stream.

**foldLeft(initial,fn)** Apply functors from Left to right, and return Promise.

**foldRight(initial,fn)** Apply functors from Right to left, and return Promise.

**size()** Return size of stream.

**concat(...streams)** Combine multiple streams in one.

**toArray()** Convert stream to array, Return Promise

**toList()** Convert stream to synchronous List and returning Promise.

**unsafeRun(resolve,reject):** run tasks and returning Promise as end result (synchronous List) Alias .toList().

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
