import { Iterator } from './iterator';
export declare class LinkedList<E> {
    private _first;
    private _last;
    private _size;
    get size(): number;
    isEmpty(): boolean;
    clear(): void;
    unshift(element: E): () => void;
    push(element: E): () => void;
    private _insert;
    shift(): E | undefined;
    pop(): E | undefined;
    private _remove;
    iterator(): Iterator<E>;
    toArray(): E[];
}
