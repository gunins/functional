import { task } from "../src/functional/core/Task";
import { get } from "../src/functional/async/Fetch";
task({ uri: '/test' }).through(get).map((_) => _.toString());
//# sourceMappingURL=asyncTest.js.map