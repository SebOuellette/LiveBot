"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleSequence = exports.Sequence = void 0;
const event_1 = require("./event");
class Sequence {
    constructor() {
        this.elements = [];
        this._onDidSplice = new event_1.Emitter();
        this.onDidSplice = this._onDidSplice.event;
    }
    splice(start, deleteCount, toInsert = []) {
        this.elements.splice(start, deleteCount, ...toInsert);
        this._onDidSplice.fire({ start, deleteCount, toInsert });
    }
}
exports.Sequence = Sequence;
class SimpleSequence {
    constructor(elements, onDidAdd, onDidRemove) {
        this._elements = [...elements];
        this.onDidSplice = event_1.Event.any(event_1.Event.map(onDidAdd, e => ({ start: this.elements.length, deleteCount: 0, toInsert: [e] })), event_1.Event.map(event_1.Event.filter(event_1.Event.map(onDidRemove, e => this.elements.indexOf(e)), i => i > -1), i => ({ start: i, deleteCount: 1, toInsert: [] })));
        this.disposable = this.onDidSplice(({ start, deleteCount, toInsert }) => this._elements.splice(start, deleteCount, ...toInsert));
    }
    get elements() { return this._elements; }
    dispose() {
        this.disposable.dispose();
    }
}
exports.SimpleSequence = SimpleSequence;
