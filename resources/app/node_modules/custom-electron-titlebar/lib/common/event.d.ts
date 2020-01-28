import { IDisposable } from './lifecycle';
import { LinkedList } from './linkedList';
/**
 * To an event a function with one or zero parameters
 * can be subscribed. The event is the subscriber function itself.
 */
export interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
}
export declare namespace Event {
    const None: Event<any>;
    /**
     * Given an event, returns another event which only fires once.
     */
    function once<T>(event: Event<T>): Event<T>;
    /**
     * Given an event and a `map` function, returns another event which maps each element
     * throught the mapping function.
     */
    function map<I, O>(event: Event<I>, map: (i: I) => O): Event<O>;
    /**
     * Given an event and an `each` function, returns another identical event and calls
     * the `each` function per each element.
     */
    function forEach<I>(event: Event<I>, each: (i: I) => void): Event<I>;
    /**
     * Given an event and a `filter` function, returns another event which emits those
     * elements for which the `filter` function returns `true`.
     */
    function filter<T>(event: Event<T>, filter: (e: T) => boolean): Event<T>;
    function filter<T, R>(event: Event<T | R>, filter: (e: T | R) => e is R): Event<R>;
    /**
     * Given an event, returns the same event but typed as `Event<void>`.
     */
    function signal<T>(event: Event<T>): Event<void>;
    /**
     * Given a collection of events, returns a single event which emits
     * whenever any of the provided events emit.
     */
    function any<T>(...events: Event<T>[]): Event<T>;
    /**
     * Given an event and a `merge` function, returns another event which maps each element
     * and the cummulative result throught the `merge` function. Similar to `map`, but with memory.
     */
    function reduce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, initial?: O): Event<O>;
    /**
     * Debounces the provided event, given a `merge` function.
     *
     * @param event The input event.
     * @param merge The reducing function.
     * @param delay The debouncing delay in millis.
     * @param leading Whether the event should fire in the leading phase of the timeout.
     * @param leakWarningThreshold The leak warning threshold override.
     */
    function debounce<T>(event: Event<T>, merge: (last: T, event: T) => T, delay?: number, leading?: boolean, leakWarningThreshold?: number): Event<T>;
    function debounce<I, O>(event: Event<I>, merge: (last: O | undefined, event: I) => O, delay?: number, leading?: boolean, leakWarningThreshold?: number): Event<O>;
    /**
     * Given an event, it returns another event which fires only once and as soon as
     * the input event emits. The event data is the number of millis it took for the
     * event to fire.
     */
    function stopwatch<T>(event: Event<T>): Event<number>;
    /**
     * Given an event, it returns another event which fires only when the event
     * element changes.
     */
    function latch<T>(event: Event<T>): Event<T>;
    /**
     * Buffers the provided event until a first listener comes
     * along, at which point fire all the events at once and
     * pipe the event from then on.
     *
     * ```typescript
     * const emitter = new Emitter<number>();
     * const event = emitter.event;
     * const bufferedEvent = buffer(event);
     *
     * emitter.fire(1);
     * emitter.fire(2);
     * emitter.fire(3);
     * // nothing...
     *
     * const listener = bufferedEvent(num => console.log(num));
     * // 1, 2, 3
     *
     * emitter.fire(4);
     * // 4
     * ```
     */
    function buffer<T>(event: Event<T>, nextTick?: boolean, _buffer?: T[]): Event<T>;
    /**
     * Similar to `buffer` but it buffers indefinitely and repeats
     * the buffered events to every new listener.
     */
    function echo<T>(event: Event<T>, nextTick?: boolean, buffer?: T[]): Event<T>;
    interface IChainableEvent<T> {
        event: Event<T>;
        map<O>(fn: (i: T) => O): IChainableEvent<O>;
        forEach(fn: (i: T) => void): IChainableEvent<T>;
        filter(fn: (e: T) => boolean): IChainableEvent<T>;
        reduce<R>(merge: (last: R | undefined, event: T) => R, initial?: R): IChainableEvent<R>;
        latch(): IChainableEvent<T>;
        on(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
        once(listener: (e: T) => any, thisArgs?: any, disposables?: IDisposable[]): IDisposable;
    }
    function chain<T>(event: Event<T>): IChainableEvent<T>;
    interface NodeEventEmitter {
        on(event: string | symbol, listener: Function): this;
        removeListener(event: string | symbol, listener: Function): this;
    }
    function fromNodeEventEmitter<T>(emitter: NodeEventEmitter, eventName: string, map?: (...args: any[]) => T): Event<T>;
    function fromPromise<T = any>(promise: Promise<T>): Event<undefined>;
    function toPromise<T>(event: Event<T>): Promise<T>;
}
declare type Listener<T> = [(e: T) => void, any] | ((e: T) => void);
export interface EmitterOptions {
    onFirstListenerAdd?: Function;
    onFirstListenerDidAdd?: Function;
    onListenerDidAdd?: Function;
    onLastListenerRemove?: Function;
    leakWarningThreshold?: number;
}
export declare function setGlobalLeakWarningThreshold(n: number): IDisposable;
/**
 * The Emitter can be used to expose an Event to the public
 * to fire it from the insides.
 * Sample:
    class Document {

        private _onDidChange = new Emitter<(value:string)=>any>();

        public onDidChange = this._onDidChange.event;

        // getter-style
        // get onDidChange(): Event<(value:string)=>any> {
        // 	return this._onDidChange.event;
        // }

        private _doIt() {
            //...
            this._onDidChange.fire(value);
        }
    }
 */
export declare class Emitter<T> {
    private static readonly _noop;
    private readonly _options?;
    private readonly _leakageMon?;
    private _disposed;
    private _event?;
    private _deliveryQueue;
    protected _listeners?: LinkedList<Listener<T>>;
    constructor(options?: EmitterOptions);
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get event(): Event<T>;
    /**
     * To be kept private to fire an event to
     * subscribers
     */
    fire(event: T): void;
    dispose(): void;
}
export interface IWaitUntil {
    waitUntil(thenable: Promise<any>): void;
}
export declare class AsyncEmitter<T extends IWaitUntil> extends Emitter<T> {
    private _asyncDeliveryQueue;
    fireAsync(eventFn: (thenables: Promise<any>[], listener: Function) => T): Promise<void>;
}
/**
 * The EventBufferer is useful in situations in which you want
 * to delay firing your events during some code.
 * You can wrap that code and be sure that the event will not
 * be fired during that wrap.
 *
 * ```
 * const emitter: Emitter;
 * const delayer = new EventDelayer();
 * const delayedEvent = delayer.wrapEvent(emitter.event);
 *
 * delayedEvent(console.log);
 *
 * delayer.bufferEvents(() => {
 *   emitter.fire(); // event will not be fired yet
 * });
 *
 * // event will only be fired at this point
 * ```
 */
export declare class EventBufferer {
    private buffers;
    wrapEvent<T>(event: Event<T>): Event<T>;
    bufferEvents<R = void>(fn: () => R): R;
}
/**
 * A Relay is an event forwarder which functions as a replugabble event pipe.
 * Once created, you can connect an input event to it and it will simply forward
 * events from that input event through its own `event` property. The `input`
 * can be changed at any point in time.
 */
export declare class Relay<T> implements IDisposable {
    private listening;
    private inputEvent;
    private inputEventListener;
    private emitter;
    readonly event: Event<T>;
    set input(event: Event<T>);
    dispose(): void;
}
export {};
