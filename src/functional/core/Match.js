/**
 * Method pattern matching, applying functor if matc, else returning type with initial value.
 * @param type defining type which one to return
 * @params list of patterns takino @Object (case is function by taking initial value and return option,
 * "=>" is function to be applied for matching pattern and returning same @param type)
 * */
const match = (type) => (...args) => (resp) => {
    const {case: value, ['=>']: functor} = args.find(({case: _}) => _(resp).isOption() && _(resp).isSome()) || {};
    return functor ? functor(value(resp).get()) : type(resp);
};

export {match}