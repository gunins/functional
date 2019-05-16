import { some } from "../src/functional/core/Maybe";
const a = some(52);
console.log(a.get());
const b = a.map((a) => a + 1);
console.log(b);
//# sourceMappingURL=MaybeTest.js.map