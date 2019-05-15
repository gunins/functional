import {list, List} from "../src/functional/core/List";

let a = new List(1, 2, 3);
a.map<void>((_) => console.log(_));
