"use strict";
exports.__esModule = true;
var Maybe_1 = require("../src/functional/core/Maybe");
var a = Maybe_1.some(52);
console.log(a.get());
var b = a.map(function (a) { return a + '1'; });
console.log(b);
