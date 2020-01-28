"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const iterator_1 = require("./iterator");
class Node {
    constructor(element) {
        this.element = element;
    }
}
class LinkedList {
    constructor() {
        this._size = 0;
    }
    get size() {
        return this._size;
    }
    isEmpty() {
        return !this._first;
    }
    clear() {
        this._first = undefined;
        this._last = undefined;
        this._size = 0;
    }
    unshift(element) {
        return this._insert(element, false);
    }
    push(element) {
        return this._insert(element, true);
    }
    _insert(element, atTheEnd) {
        const newNode = new Node(element);
        if (!this._first) {
            this._first = newNode;
            this._last = newNode;
        }
        else if (atTheEnd) {
            // push
            const oldLast = this._last;
            this._last = newNode;
            newNode.prev = oldLast;
            oldLast.next = newNode;
        }
        else {
            // unshift
            const oldFirst = this._first;
            this._first = newNode;
            newNode.next = oldFirst;
            oldFirst.prev = newNode;
        }
        this._size += 1;
        return this._remove.bind(this, newNode);
    }
    shift() {
        if (!this._first) {
            return undefined;
        }
        else {
            const res = this._first.element;
            this._remove(this._first);
            return res;
        }
    }
    pop() {
        if (!this._last) {
            return undefined;
        }
        else {
            const res = this._last.element;
            this._remove(this._last);
            return res;
        }
    }
    _remove(node) {
        let candidate = this._first;
        while (candidate instanceof Node) {
            if (candidate !== node) {
                candidate = candidate.next;
                continue;
            }
            if (candidate.prev && candidate.next) {
                // middle
                let anchor = candidate.prev;
                anchor.next = candidate.next;
                candidate.next.prev = anchor;
            }
            else if (!candidate.prev && !candidate.next) {
                // only node
                this._first = undefined;
                this._last = undefined;
            }
            else if (!candidate.next) {
                // last
                this._last = this._last.prev;
                this._last.next = undefined;
            }
            else if (!candidate.prev) {
                // first
                this._first = this._first.next;
                this._first.prev = undefined;
            }
            // done
            this._size -= 1;
            break;
        }
    }
    iterator() {
        let element;
        let node = this._first;
        return {
            next() {
                if (!node) {
                    return iterator_1.FIN;
                }
                if (!element) {
                    element = { done: false, value: node.element };
                }
                else {
                    element.value = node.element;
                }
                node = node.next;
                return element;
            }
        };
    }
    toArray() {
        let result = [];
        for (let node = this._first; node instanceof Node; node = node.next) {
            result.push(node.element);
        }
        return result;
    }
}
exports.LinkedList = LinkedList;
