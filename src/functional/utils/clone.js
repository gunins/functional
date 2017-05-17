import {list} from '../core/List';

let pair = (guard, action) => {
        return {guard, action}
    },

// map method for Objects
    objCopy = obj => {
        let copy = Object.assign({}, obj);
        return (fn) => {
            Object.keys(copy).forEach(attr => {
                copy[attr] = fn(copy[attr]);
            });
            return copy;
        }
    },

//Guards
    isSimple = (obj) => typeof obj == 'boolean' || null == obj || 'object' != typeof obj,
    isDate = (obj) => Object.prototype.toString.call(obj) === '[object Date]',
    isArray = (obj) => Object.prototype.toString.call(obj) === '[object Array]',
    isObject = (obj) => (!!obj) && (obj.constructor === Object),
    isOther = (obj) => !isDate(obj) && !isArray(obj) && !isObject(obj),

// Cloning actions, for different types
    //All imutable references returning same instance
    cloneSimple = (simple) => () => simple,
    cloneDate = (date) => () => {
        let copy = new Date();
        copy.setTime(date.getTime());
        return copy
    },
    cloneArray = (arr) => (fn) => arr.map(fn),
    cloneObj = (obj) => (fn) => objCopy(obj)(fn),

// Define functors, with guards and actions
    arrayFunctor = pair(isArray, cloneArray),
    dateFunctor = pair(isDate, cloneDate),
    objectFunctor = pair(isObject, cloneObj),
    otherFunctor = pair(isOther, cloneSimple),

//take all functors in a list.
    functors = list(arrayFunctor, dateFunctor, objectFunctor, otherFunctor),
    getFunctor = (obj) => functors.find(fn => fn.guard(obj)).action(obj),
    clone = (obj) => getFunctor(obj)(children => clone(children));

export {clone, isSimple, isDate, isArray, isObject}
