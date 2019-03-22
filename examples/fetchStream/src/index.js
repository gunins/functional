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



const customStream = (rs) => readerStream(rs)
    .through(writeStream)
    .run();

task({uri: './tortoise.png'})
    .map(({uri}) => fetch(uri))
    .map(({body}) => body)
    .map((rs) => customStream(rs))
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
