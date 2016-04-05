'use strict';

{
    // Let's try out some Symbols!

    let sym = Symbol('foo');
    let obj = { [sym]: 'bar' };
    console.log(obj[sym]);
}


{
    let obj = {
        [Symbol.iterator]: function* () {
            yield 5;
            yield 4;
            yield 3;
            yield 2;
            yield 1;
        },
    };

    console.log([...obj]);
}


{
    let obj = new Proxy({}, {
        has: (target, prop) => parseInt(prop, 10) < 5,

        get: (target, prop) => {
            if (prop in Object.prototype) return Object.prototype[prop];
            return parseInt(prop, 10) + 2;
        },

        apply: (target, thisArg, argumentsList) => {
            return 5 * argumentsList.length;
        },
    });

    console.log(Reflect.has(obj, 4), 6 in obj);

    console.log(obj[5]);

    console.log(obj(1, 2, 3, 4));
}
