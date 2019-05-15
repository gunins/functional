
import {Some,None, some, none} from "../src/functional/core/Maybe";

const a = some(52);
console.log(a.get());

const b = a.map<number>((a)=>a+1);
console.log(b);
