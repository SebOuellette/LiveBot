export interface IDisposable {
    dispose(): void;
}
export declare function isDisposable<E extends object>(thing: E): thing is E & IDisposable;
export declare function dispose<T extends IDisposable>(disposable: T): T;
export declare function dispose<T extends IDisposable>(...disposables: Array<T | undefined>): T[];
export declare function dispose<T extends IDisposable>(disposables: T[]): T[];
export declare function combinedDisposable(disposables: IDisposable[]): IDisposable;
export declare function toDisposable(fn: () => void): IDisposable;
export declare abstract class Disposable implements IDisposable {
    static None: Readonly<IDisposable>;
    protected _toDispose: IDisposable[];
    protected get toDispose(): IDisposable[];
    private _lifecycle_disposable_isDisposed;
    dispose(): void;
    protected _register<T extends IDisposable>(t: T): T;
}
