"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIN = { done: true, value: undefined };
var Iterator;
(function (Iterator) {
    const _empty = {
        next() {
            return exports.FIN;
        }
    };
    function empty() {
        return _empty;
    }
    Iterator.empty = empty;
    function fromArray(array, index = 0, length = array.length) {
        return {
            next() {
                if (index >= length) {
                    return exports.FIN;
                }
                return { done: false, value: array[index++] };
            }
        };
    }
    Iterator.fromArray = fromArray;
    function from(elements) {
        if (!elements) {
            return Iterator.empty();
        }
        else if (Array.isArray(elements)) {
            return Iterator.fromArray(elements);
        }
        else {
            return elements;
        }
    }
    Iterator.from = from;
    function map(iterator, fn) {
        return {
            next() {
                const element = iterator.next();
                if (element.done) {
                    return exports.FIN;
                }
                else {
                    return { done: false, value: fn(element.value) };
                }
            }
        };
    }
    Iterator.map = map;
    function filter(iterator, fn) {
        return {
            next() {
                while (true) {
                    const element = iterator.next();
                    if (element.done) {
                        return exports.FIN;
                    }
                    if (fn(element.value)) {
                        return { done: false, value: element.value };
                    }
                }
            }
        };
    }
    Iterator.filter = filter;
    function forEach(iterator, fn) {
        for (let next = iterator.next(); !next.done; next = iterator.next()) {
            fn(next.value);
        }
    }
    Iterator.forEach = forEach;
    function collect(iterator) {
        const result = [];
        forEach(iterator, value => result.push(value));
        return result;
    }
    Iterator.collect = collect;
})(Iterator = exports.Iterator || (exports.Iterator = {}));
function getSequenceIterator(arg) {
    if (Array.isArray(arg)) {
        return Iterator.fromArray(arg);
    }
    else {
        return arg;
    }
}
exports.getSequenceIterator = getSequenceIterator;
class ArrayIterator {
    constructor(items, start = 0, end = items.length, index = start - 1) {
        this.items = items;
        this.start = start;
        this.end = end;
        this.index = index;
    }
    first() {
        this.index = this.start;
        return this.current();
    }
    next() {
        this.index = Math.min(this.index + 1, this.end);
        return this.current();
    }
    current() {
        if (this.index === this.start - 1 || this.index === this.end) {
            return null;
        }
        return this.items[this.index];
    }
}
exports.ArrayIterator = ArrayIterator;
class ArrayNavigator extends ArrayIterator {
    constructor(items, start = 0, end = items.length, index = start - 1) {
        super(items, start, end, index);
    }
    current() {
        return super.current();
    }
    previous() {
        this.index = Math.max(this.index - 1, this.start - 1);
        return this.current();
    }
    first() {
        this.index = this.start;
        return this.current();
    }
    last() {
        this.index = this.end - 1;
        return this.current();
    }
    parent() {
        return null;
    }
}
exports.ArrayNavigator = ArrayNavigator;
class MappedIterator {
    constructor(iterator, fn) {
        this.iterator = iterator;
        this.fn = fn;
        // noop
    }
    next() { return this.fn(this.iterator.next()); }
}
exports.MappedIterator = MappedIterator;
class MappedNavigator extends MappedIterator {
    constructor(navigator, fn) {
        super(navigator, fn);
        this.navigator = navigator;
    }
    current() { return this.fn(this.navigator.current()); }
    previous() { return this.fn(this.navigator.previous()); }
    parent() { return this.fn(this.navigator.parent()); }
    first() { return this.fn(this.navigator.first()); }
    last() { return this.fn(this.navigator.last()); }
    next() { return this.fn(this.navigator.next()); }
}
exports.MappedNavigator = MappedNavigator;
