export declare class MultiDisposeError extends Error {
    readonly errors: any[];
    constructor(errors: any[]);
}
export interface IDisposable {
    dispose(): void;
}
export declare function isDisposable<E extends object>(thing: E): thing is E & IDisposable;
export declare function dispose<T extends IDisposable>(disposable: T): T;
export declare function dispose<T extends IDisposable>(disposable: T | undefined): T | undefined;
export declare function dispose<T extends IDisposable, A extends IterableIterator<T> = IterableIterator<T>>(disposables: IterableIterator<T>): A;
export declare function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>;
export declare function dispose<T extends IDisposable>(disposables: ReadonlyArray<T>): ReadonlyArray<T>;
export declare function combinedDisposable(...disposables: IDisposable[]): IDisposable;
export declare function toDisposable(fn: () => void): IDisposable;
export declare class DisposableStore implements IDisposable {
    static DISABLE_DISPOSED_WARNING: boolean;
    private _toDispose;
    private _isDisposed;
    /**
     * Dispose of all registered disposables and mark this object as disposed.
     *
     * Any future disposables added to this object will be disposed of on `add`.
     */
    dispose(): void;
    /**
     * Dispose of all registered disposables but do not mark this object as disposed.
     */
    clear(): void;
    add<T extends IDisposable>(t: T): T;
}
export declare abstract class Disposable implements IDisposable {
    static readonly None: Readonly<IDisposable>;
    private readonly _store;
    constructor();
    dispose(): void;
    protected _register<T extends IDisposable>(t: T): T;
}
/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
export declare class MutableDisposable<T extends IDisposable> implements IDisposable {
    private _value?;
    private _isDisposed;
    constructor();
    get value(): T | undefined;
    set value(value: T | undefined);
    clear(): void;
    dispose(): void;
}
export interface IReference<T> extends IDisposable {
    readonly object: T;
}
export declare abstract class ReferenceCollection<T> {
    private readonly references;
    acquire(key: string, ...args: any[]): IReference<T>;
    protected abstract createReferencedObject(key: string, ...args: any[]): T;
    protected abstract destroyReferencedObject(key: string, object: T): void;
}
export declare class ImmortalReference<T> implements IReference<T> {
    object: T;
    constructor(object: T);
    dispose(): void;
}
