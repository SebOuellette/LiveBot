export declare namespace Iterable {
    function is<T = any>(thing: any): thing is IterableIterator<T>;
    function empty<T = any>(): Iterable<T>;
    function single<T>(element: T): Iterable<T>;
    function from<T>(iterable: Iterable<T> | undefined | null): Iterable<T>;
    function first<T>(iterable: Iterable<T>): T | undefined;
    function some<T>(iterable: Iterable<T>, predicate: (t: T) => boolean): boolean;
    function filter<T>(iterable: Iterable<T>, predicate: (t: T) => boolean): Iterable<T>;
    function map<T, R>(iterable: Iterable<T>, fn: (t: T) => R): Iterable<R>;
    function concat<T>(...iterables: Iterable<T>[]): Iterable<T>;
    /**
     * Consumes `atMost` elements from iterable and returns the consumed elements,
     * and an iterable for the rest of the elements.
     */
    function consume<T>(iterable: Iterable<T>, atMost?: number): [T[], Iterable<T>];
}
