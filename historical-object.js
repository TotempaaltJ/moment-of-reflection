'use strict';

let Identifier = Symbol('HistoricalObject');
let HistoryTracker = Symbol('HistoricalObject-HistoryTracker');
let wellKnowns = [];
Reflect.ownKeys(Symbol).forEach(key => {
    if([ 'length', 'prototype' ].includes(key)) return;

    wellKnowns.push(Symbol[key]);
});
wellKnowns.push('inspect');
wellKnowns.push('valueOf');


function HistoricalObject(original) {
    let copy = Object.assign({}, {
        [HistoryTracker]: {},
        [Identifier]: true,
    });

    let obj = new Proxy(copy, {
        set: (target, prop, value) => {
            if (!Reflect.has(target[HistoryTracker], prop)) {
                target[HistoryTracker][prop] = {
                    revisions: [],
                    access_count: 0,
                };
            }

            target[HistoryTracker][prop].revisions.splice(0, 0, value);
            target[prop] = value;
            return true;
        },

        get: (target, prop) => {
            if (Reflect.has(Object.prototype)) return Object.prototype[prop];
            if (Object.getOwnPropertySymbols(target).includes(prop)) return target[prop];
            if (wellKnowns.includes(prop)) return target[prop];

            if (!Reflect.has(target, prop)) return undefined;

            target[HistoryTracker][prop].access_count += 1;
            return target[prop];
        },
    });

    Object.assign(obj, original);

    return obj;
}


HistoricalObject.getAccessCount = function(obj, prop) {
    return obj[HistoryTracker][prop].access_count;
};

HistoricalObject.getRevisions = function(obj, prop) {
    return obj[HistoryTracker][prop].revisions;
};

HistoricalObject.revert = function(obj, prop) {
    let tracker = obj[HistoryTracker][prop];

    obj[prop] = tracker.revisions[1];
    tracker.revisions.splice(0, 2);
};


// Let's make a historical object
let test = HistoricalObject({
    foo: 'bar',
    baz: [12, 3],
});

// Look! A revision history!
console.log(HistoricalObject.getRevisions(test, 'foo'));
test.foo = 'qux';
console.log(HistoricalObject.getRevisions(test, 'foo'));
test.foo = 'zoop';
console.log(HistoricalObject.getRevisions(test, 'foo'));

// See if the access count work (should be 1)
console.log(test.foo);
console.log(HistoricalObject.getRevisions(test, 'foo'), HistoricalObject.getAccessCount(test, 'foo'));

// Check if it works for setting new properties
test.bar = 5;
test.bar = 12;
console.log(HistoricalObject.getRevisions(test, 'bar'));

// Print the whole damn thing
console.log(test);

// Revert the last change (should set it to qux
HistoricalObject.revert(test, 'foo');
console.log(test.foo, HistoricalObject.getRevisions(test, 'foo'));

// Should return undefined
console.log(test.lol);


/*
 * test.foo = HistoricalArray([1, 2, 3, 4]);
 * console.log(HistoricalObject.getRevisions(test, 'foo'));
 * test.foo.push(4)
 * console.log(HistoricalObject.getRevisions(test, 'foo'));
 */
