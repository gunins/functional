import {list} from '../core/List';

const {assign, keys} = Object;

const pair = (guard, action) => ({guard, action});

// map method for Objects
const objCopy = (obj, fn) => keys(obj).reduce((initial, attr) => assign(initial, {[attr]: fn(obj[attr])}), {});

//Guards
const isSimple = (obj) => typeof obj == 'boolean' || null == obj || 'object' != typeof obj;
const isDate = (obj) => Object.prototype.toString.call(obj) === '[object Date]';
const isArray = (obj) => Object.prototype.toString.call(obj) === '[object Array]';
const isObject = (obj) => (!!obj) && (obj.constructor === Object);
const isOther = (obj) => !isDate(obj) && !isArray(obj) && !isObject(obj);

// Cloning actions, for different types
//All imutable references returning same instance
const cloneSimple = (simple) => () => simple;
const cloneDate = (date) => () => new Date(date.getTime());
const cloneArray = (arr) => (fn) => arr.map(fn);
const cloneObj = (obj) => (fn) => objCopy(obj, fn);

// Define functors, with guards and actions
const arrayFunctor = pair(isArray, cloneArray);
const dateFunctor = pair(isDate, cloneDate);
const objectFunctor = pair(isObject, cloneObj);
const otherFunctor = pair(isOther, cloneSimple);

//take all functors in a list.
const functors = list(arrayFunctor, dateFunctor, objectFunctor, otherFunctor);
const getFunctor = (obj) => functors.find(fn => fn.guard(obj)).action(obj);
const clone = (obj) => getFunctor(obj)(children => clone(children));

export {clone, isSimple, isDate, isArray, isObject}
