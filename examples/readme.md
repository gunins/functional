# Nodejs Streams make it simple

## Streams Overview.

For a while Nodejs streams are available in API, and have reputation for being hard to work, and even harder to understand. I think that's no longer the case.

Streams are collections of data, and can be anything (Buffer, strings, arrays etc). The key difference they might not be available at once, and they don't have to fit in memory. For large datasets, or data from external source, this makes streams very powerful. 

Streams not only about large datasets. They also give us power of composability in our code. Many of the built in modules in Nodejs implement the streaming interface. Very known is Nodejs `http` module. Where we read from `http.IncomingMessage` and write to `http.ServerResponse`.

## Why Streams

Streams has two main advantages. 
- **Memory efficiency** For proccesing large amount of data, you not increasing memory.
- **Time efficiency** will start processing data s soon you have it, rather than wait untill entire payload has been transmitted.

## In Nodejs are 4 types of streams:
	
- **Writable** streams to which we can write. For example `fs.createWriteStream()` to write data to file using stream
- **Readable** streams from wich we can read. For example `fs.createReadStream()` to read data/contents from the file.
- **Duplex** streams supporting both read and write. Like `net.Socket`  
- **Transform**  streams can modify data, for example `zlib` read from file, compress and save to another file destination.

Also streams are supported in latest browsers.

## A practical example

One way to read data from a stream is to listen to data event and attach a callback. When a chunk of data is available, the readable stream emits a data event and your callback executes. Take a look at the following snippet:

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

In this example is very easy, you read file and store in to Buffer.

And if you want to chain streams together, there is one easy way.

```javascript

import fs from 'fs';
import zlib from 'zlib';

fs.createReadStream('input.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('output.txt'));


````

Very simple, and easy. Sometimes, if read is much faster than write, after some time you are out of memory.

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

This solution is safe, but what if you want to compose streams, and transformations. Means for each pipe, you have to create stream with some type 
(readable, writable, transform or duplex).

Composition now becomes more complex, and if you have multiple transformation steps, code will be challenge.

[https://github.com/gunins/functional](https://github.com/gunins/functional) provide easy stream support, all streams are composable, and lazy.
Most important, all streams in paused mode, this means safe for memory.


## Make streams easy

When use streams, you don't want afraid some cases, if your app can go out of memory, but you want to compose streams. 
Another part, you might want to do some transformation for chunks, But for this you need create stream. In `functional_tasks` 
have built in functionality for different types of streams.

Basic example, transform readable stream to uppercase, and write to destination on the fly.

```javascript

    import {fileReadStream, fileWriteStream} from 'functional_tasks';
        fileReadStream('./file.txt')
                .map((chunk) => chunk.toString('utf8'))
                .map((str) => str.toUpperCase())
                .through(fileWriteStream('./destination.txt'))
                .run();

```


`fileReadStream` and `fileWriteStream` are built in library, and very easy to use. In this example, we read buffer chunk, 
convert to utf8 string, convert to UpperCase, and write to destination. After pipeline is created, we start stream by calling .run(). 
And run() will return promise, here you can catch the errors. 

There is another example, where you can use multiple streams, in same time.

```javascript

import {stream, fileReadStream, fileWriteStream} from 'functional_tasks';
        const toUpperCase = stream()
            .map((chunk) => chunk.toString('utf8'))
            .map((str) => str.toUpperCase());
        
        const streamA = fileReadStream('./fileA.txt')
                .through(toUpperCase)
                .through(fileWriteStream('./destinationA.txt'));
        
        const streamB = fileReadStream('./fileB.txt')
        		.through(toUpperCase)
                .through(fileWriteStream('./destinationB.txt'));
        
        const streamResult = await Promise.all([streamA.run(), streamB.run()])

```

Like you see in example above you have transform stream `toUpperCase` and you use it in two different streams below. 
This means, streams are not sharing context, and they only executes, when you add `.run()` at the end.

## More Complex example

What's if stream are not part of this library. In next example, we try to achieve following steps. 

- read file
- zip it
- encode
- write to another destination.

Ok before start need some preparation work.

```javascript
import path from 'path';
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash
} from 'crypto';

	const source = path.resolve('./data/divine-comedy.txt');
	const destination = path.resolve('./divine-comedy.txt.gzip');

	const getChiperKey = (secret) => createHash('md5')
	    .update(secret)
	    .digest('hex');

	const initVect = randomBytes(16);

	const encodeGZip = (secret, initVect) => createCipheriv('aes256', getChiperKey(secret), initVect);
	...

```

We simply prepare paths and encryption for encoding.

Now need import data for stream


```javascript
import {createGzip} from 'zlib';
import {duplexStream, fileReadStream, fileWriteStream} from 'functional_tasks';
	...
	fileReadStream(source)
    .through(duplexStream(createGzip()))
    .through(duplexStream(encodeGZip(secret, initVect)))
    .through(fileWriteStream(destination))
    ...

```

As you see `createGzip` and `encodeGzip` not supported by library, but they are duplex streams. We import converter utility.

There is full example.


```javascript
import {duplexStream, fileReadStream, fileWriteStream} from 'functional_tasks';
import {createGzip} from 'zlib';
import path from 'path';
import {
    createCipheriv,
    createDecipheriv,
    randomBytes,
    createHash
} from 'crypto';


	const source = path.resolve('./data/divine-comedy.txt');
	const destination = path.resolve('./divine-comedy.txt.gzip');

	const getChiperKey = (secret) => createHash('md5')
	    .update(secret)
	    .digest('hex');

	const initVect = randomBytes(16);

	const encodeGZip = (secret, initVect) => createCipheriv('aes256', getChiperKey(secret), initVect);

	const secret = 'SECRET';

	fileReadStream(source)
	    .through(duplexStream(createGzip()))
	    .through(duplexStream(encodeGZip(secret, initVect)))
	    .through(fileWriteStream(destination))
	    .run()
	    .then(() => console.log('zip finished'))
  

```

All examples you can find in examples section [https://github.com/gunins/functional/tree/master/examples](https://github.com/gunins/functional/tree/master/examples) 

## Conclusion

This was introduction in to most powerful Nodejs feature Streams. 

## References

 - [Functional Tasks/ Streams](https://github.com/gunins/functional)
 - [Express alternative to use functional_tasks library, including streams](https://github.com/gunins/service-worker-router)




