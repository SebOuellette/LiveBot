"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmortalReference = exports.ReferenceCollection = exports.MutableDisposable = exports.Disposable = exports.DisposableStore = exports.toDisposable = exports.combinedDisposable = exports.dispose = exports.isDisposable = exports.MultiDisposeError = void 0;
const functional_1 = require("./functional");
const iterator_1 = require("./iterator");
/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
 */
const TRACK_DISPOSABLES = false;
const __is_disposable_tracked__ = '__is_disposable_tracked__';
function markTracked(x) {
    if (!TRACK_DISPOSABLES) {
        return;
    }
    if (x && x !== Disposable.None) {
        try {
            x[__is_disposable_tracked__] = true;
        }
        catch {
            // noop
        }
    }
}
function trackDisposable(x) {
    if (!TRACK_DISPOSABLES) {
        return x;
    }
    const stack = new Error('Potentially leaked disposable').stack;
    setTimeout(() => {
        if (!x[__is_disposable_tracked__]) {
            console.log(stack);
        }
    }, 3000);
    return x;
}
class MultiDisposeError extends Error {
    constructor(errors) {
        super(`Encounter errors while disposing of store. Errors: [${errors.join(', ')}]`);
        this.errors = errors;
    }
}
exports.MultiDisposeError = MultiDisposeError;
function isDisposable(thing) {
    return typeof thing.dispose === 'function' && thing.dispose.length === 0;
}
exports.isDisposable = isDisposable;
function dispose(arg) {
    if (iterator_1.Iterable.is(arg)) {
        let errors = [];
        for (const d of arg) {
            if (d) {
                markTracked(d);
                try {
                    d.dispose();
                }
                catch (e) {
                    errors.push(e);
                }
            }
        }
        if (errors.length === 1) {
            throw errors[0];
        }
        else if (errors.length > 1) {
            throw new MultiDisposeError(errors);
        }
        return Array.isArray(arg) ? [] : arg;
    }
    else if (arg) {
        markTracked(arg);
        arg.dispose();
        return arg;
    }
}
exports.dispose = dispose;
function combinedDisposable(...disposables) {
    disposables.forEach(markTracked);
    return trackDisposable({ dispose: () => dispose(disposables) });
}
exports.combinedDisposable = combinedDisposable;
function toDisposable(fn) {
    const self = trackDisposable({
        dispose: () => {
            markTracked(self);
            fn();
        }
    });
    return self;
}
exports.toDisposable = toDisposable;
class DisposableStore {
    constructor() {
        this._toDispose = new Set();
        this._isDisposed = false;
    }
    /**
     * Dispose of all registered disposables and mark this object as disposed.
     *
     * Any future disposables added to this object will be disposed of on `add`.
     */
    dispose() {
        if (this._isDisposed) {
            return;
        }
        markTracked(this);
        this._isDisposed = true;
        this.clear();
    }
    /**
     * Dispose of all registered disposables but do not mark this object as disposed.
     */
    clear() {
        try {
            dispose(this._toDispose.values());
        }
        finally {
            this._toDispose.clear();
        }
    }
    add(t) {
        if (!t) {
            return t;
        }
        if (t === this) {
            throw new Error('Cannot register a disposable on itself!');
        }
        markTracked(t);
        if (this._isDisposed) {
            if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                console.warn(new Error('Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!').stack);
            }
        }
        else {
            this._toDispose.add(t);
        }
        return t;
    }
}
exports.DisposableStore = DisposableStore;
DisposableStore.DISABLE_DISPOSED_WARNING = false;
class Disposable {
    constructor() {
        this._store = new DisposableStore();
        trackDisposable(this);
    }
    dispose() {
        markTracked(this);
        this._store.dispose();
    }
    _register(t) {
        if (t === this) {
            throw new Error('Cannot register a disposable on itself!');
        }
        return this._store.add(t);
    }
}
exports.Disposable = Disposable;
Disposable.None = Object.freeze({ dispose() { } });
/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
class MutableDisposable {
    constructor() {
        this._isDisposed = false;
        trackDisposable(this);
    }
    get value() {
        return this._isDisposed ? undefined : this._value;
    }
    set value(value) {
        if (this._isDisposed || value === this._value) {
            return;
        }
        if (this._value) {
            this._value.dispose();
        }
        if (value) {
            markTracked(value);
        }
        this._value = value;
    }
    clear() {
        this.value = undefined;
    }
    dispose() {
        this._isDisposed = true;
        markTracked(this);
        if (this._value) {
            this._value.dispose();
        }
        this._value = undefined;
    }
}
exports.MutableDisposable = MutableDisposable;
class ReferenceCollection {
    constructor() {
        this.references = new Map();
    }
    acquire(key, ...args) {
        let reference = this.references.get(key);
        if (!reference) {
            reference = { counter: 0, object: this.createReferencedObject(key, ...args) };
            this.references.set(key, reference);
        }
        const { object } = reference;
        const dispose = functional_1.once(() => {
            if (--reference.counter === 0) {
                this.destroyReferencedObject(key, reference.object);
                this.references.delete(key);
            }
        });
        reference.counter++;
        return { object, dispose };
    }
}
exports.ReferenceCollection = ReferenceCollection;
class ImmortalReference {
    constructor(object) {
        this.object = object;
    }
    dispose() { }
}
exports.ImmortalReference = ImmortalReference;
