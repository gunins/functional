import { task } from "../src/functional/core/Task";
const { assign } = Object;
let taskA = task({ a: 'a', b: 'b' });
let innerTask = taskA.resolve(data => {
    console.log(data);
});
let taskB = task((data) => assign(data, { c: 'c' }));
let taskC = taskA.through(taskB);
let dataA = taskC.unsafeRun()
    .then(_ => {
    console.log(_);
});
//# sourceMappingURL=TaskTest.js.map