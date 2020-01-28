export interface IteratorDefinedResult<T> {
    readonly done: false;
    readonly value: T;
}
export interface IteratorUndefinedResult {
    readonly done: true;
    readonly value: undefined;
}
export declare const FIN: IteratorUndefinedResult;
export declare type IteratorResult<T> = IteratorDefinedResult<T> | IteratorUndefinedResult;
export interface Iterator<T> {
    next(): IteratorResult<T>;
}
export declare module Iterator {
    function empty<T>(): Iterator<T>;
    function fromArray<T>(array: T[], index?: number, length?: number): Iterator<T>;
    function from<T>(elements: Iterator<T> | T[] | undefined): Iterator<T>;
    function map<T, R>(iterator: Iterator<T>, fn: (t: T) => R): Iterator<R>;
    function filter<T>(iterator: Iterator<T>, fn: (t: T) => boolean): Iterator<T>;
    function forEach<T>(iterator: Iterator<T>, fn: (t: T) => void): void;
    function collect<T>(iterator: Iterator<T>): T[];
}
export declare type ISequence<T> = Iterator<T> | T[];
export declare function getSequenceIterator<T>(arg: Iterator<T> | T[]): Iterator<T>;
export interface INextIterator<T> {
    next(): T | null;
}
export declare class ArrayIterator<T> implements INextIterator<T> {
    private items;
    protected start: number;
    protected end: number;
    protected index: number;
    constructor(items: T[], start?: number, end?: number, index?: number);
    first(): T | null;
    next(): T | null;
    protected current(): T | null;
}
export declare class ArrayNavigator<T> extends ArrayIterator<T> implements INavigator<T> {
    constructor(items: T[], start?: number, end?: number, index?: number);
    current(): T | null;
    previous(): T | null;
    first(): T | null;
    last(): T | null;
    parent(): T | null;
}
export declare class MappedIterator<T, R> implements INextIterator<R> {
    protected iterator: INextIterator<T>;
    protected fn: (item: T | null) => R;
    constructor(iterator: INextIterator<T>, fn: (item: T | null) => R);
    next(): R;
}
export interface INavigator<T> extends INextIterator<T> {
    current(): T | null;
    previous(): T | null;
    parent(): T | null;
    first(): T | null;
    last(): T | null;
    next(): T | null;
}
export declare class MappedNavigator<T, R> extends MappedIterator<T, R> implements INavigator<R> {
    protected navigator: INavigator<T>;
    constructor(navigator: INavigator<T>, fn: (item: T) => R);
    current(): R;
    previous(): R;
    parent(): R;
    first(): R;
    last(): R;
    next(): R;
}
