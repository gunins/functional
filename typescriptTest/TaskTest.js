"use strict";
exports.__esModule = true;
var Task_1 = require("../dist/functional/core/Task");
var assign = Object.assign;
var taskA = Task_1.task({ a: 'a', b: 'b' });
var innerTask = taskA.resolve(function (data) {
    console.log(data);
});
var taskB = Task_1.task(function (data, res, rej) {
    res(assign(data, { c: 'c' }));
});
var taskC = taskA.through(taskB);
var dataA = taskC.unsafeRun().then(function (_) {
    console.log(_);
});
