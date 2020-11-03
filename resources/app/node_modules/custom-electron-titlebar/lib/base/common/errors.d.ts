export interface ErrorListenerCallback {
    (error: any): void;
}
export interface ErrorListenerUnbind {
    (): void;
}
export declare class ErrorHandler {
    private unexpectedErrorHandler;
    private listeners;
    constructor();
    addListener(listener: ErrorListenerCallback): ErrorListenerUnbind;
    private emit;
    private _removeListener;
    setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
    getUnexpectedErrorHandler(): (e: any) => void;
    onUnexpectedError(e: any): void;
    onUnexpectedExternalError(e: any): void;
}
export declare const errorHandler: ErrorHandler;
export declare function setUnexpectedErrorHandler(newUnexpectedErrorHandler: (e: any) => void): void;
export declare function onUnexpectedError(e: any): undefined;
export declare function onUnexpectedExternalError(e: any): undefined;
export interface SerializedError {
    readonly $isError: true;
    readonly name: string;
    readonly message: string;
    readonly stack: string;
}
export declare function transformErrorForSerialization(error: Error): SerializedError;
export declare function transformErrorForSerialization(error: any): any;
export interface V8CallSite {
    getThis(): any;
    getTypeName(): string;
    getFunction(): string;
    getFunctionName(): string;
    getMethodName(): string;
    getFileName(): string;
    getLineNumber(): number;
    getColumnNumber(): number;
    getEvalOrigin(): string;
    isToplevel(): boolean;
    isEval(): boolean;
    isNative(): boolean;
    isConstructor(): boolean;
    toString(): string;
}
/**
 * Checks if the given error is a promise in canceled state
 */
export declare function isPromiseCanceledError(error: any): boolean;
/**
 * Returns an error that signals cancellation.
 */
export declare function canceled(): Error;
export declare function illegalArgument(name?: string): Error;
export declare function illegalState(name?: string): Error;
export declare function readonly(name?: string): Error;
export declare function disposed(what: string): Error;
export declare function getErrorMessage(err: any): string;
export declare class NotImplementedError extends Error {
    constructor(message?: string);
}
export declare class NotSupportedError extends Error {
    constructor(message?: string);
}
