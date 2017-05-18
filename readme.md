## Library for working with pull based async Tasks [![Build Status](https://api.travis-ci.org/gunins/stonewall.svg?branch=master)](https://travis-ci.org/gunins/functional)

! Curently this library is on development stage, po.

### Why This Library

This library inspired by [**fs2**](https://github.com/functional-streams-for-scala/fs2) Scala Library. Instead of pub sub concept, there introduced pull base concept.
You can pull sequence of tasks, transform them, and returning as promise.

Also, you can combine tasks together.

### Installation

Using npm

    npm install functional_tasks

### How it works

This library usng [**UMD**](https://github.com/umdjs/umd) modules, can be used on nodejs and browser. Also if use es6 modules, can compile from source folder, using [**rollup**](https://github.com/rollup/rollup).


### Usage examples

Create Task and apply functor, and returning promise with data. every `.map` method returning new task. all returned data is imutable. have to call resolve after any combination finished.

```javascript
    import {Task, task} from 'functional_tasks/src/core/Task';
    //Initial task
      let a = task((resolve, reject) => resolve(3))
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
Using async es6 functions
    
```javascript
    import {Task, task} from 'functional_tasks/src/core/Task';
    async ()=>{
    //Initial task
      let a = task((resolve) => resolve(3))
      //apply functor to next step. All data is imutable
            .map((res, rej, d) => {
                res(d + 1)
            });
           // get result
       let data = await a.unsafeRun();
       
       //use data
       console.log(data)
    }

```
Combining Tasks

```javascript
    import {Task, task} from 'functional_tasks/src/core/Task';

   let taskA = task({a: 'a', b: 'b'});
   let taskB = task((res, rej, data) => {
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

Function always return, resolve reject, and data
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

Async computation including list of tasks.

Usage

```javascript
    import {stream, Stream} from 'functional_tasks/src/core/Stream';
    import {task} from 'functional_tasks/src/core/Task';

    //Initial task
      let a = stream(task((_, resolve, reject) => resolve(3)))
            task((_,resolve) => {
                resolve(4)
            });
           // get result each task is asynhronus, and will return value
            a.toArray()
            .then(data => {
                // use data and data to be eql [3,4]
            });


```

**new Stream(...Task|fn|obj|value):**  Create Stream with sequence. 
**new(..Task|fn|obj|value):** create Stream, without new operator.

Function is same as Task
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

### Async Fetch

Tasks for fetch API 

Get Example 

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

Get example.

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
