import { CancellationToken } from 'vs/base/common/cancellation';
import { Event } from 'vs/base/common/event';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';
export declare function isThenable<T>(obj: any): obj is Promise<T>;
export interface CancelablePromise<T> extends Promise<T> {
    cancel(): void;
}
export declare function createCancelablePromise<T>(callback: (token: CancellationToken) => Promise<T>): CancelablePromise<T>;
export declare function raceCancellation<T>(promise: Promise<T>, token: CancellationToken): Promise<T | undefined>;
export declare function raceCancellation<T>(promise: Promise<T>, token: CancellationToken, defaultValue: T): Promise<T>;
export declare function raceTimeout<T>(promise: Promise<T>, timeout: number, onTimeout?: () => void): Promise<T>;
export declare function asPromise<T>(callback: () => T | Thenable<T>): Promise<T>;
interface Thenable<T> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => TResult | Thenable<TResult>): Thenable<TResult>;
    then<TResult>(onfulfilled?: (value: T) => TResult | Thenable<TResult>, onrejected?: (reason: any) => void): Thenable<TResult>;
}
export interface ITask<T> {
    (): T;
}
/**
 * A helper to prevent accumulation of sequential async tasks.
 *
 * Imagine a mail man with the sole task of delivering letters. As soon as
 * a letter submitted for delivery, he drives to the destination, delivers it
 * and returns to his base. Imagine that during the trip, N more letters were submitted.
 * When the mail man returns, he picks those N letters and delivers them all in a
 * single trip. Even though N+1 submissions occurred, only 2 deliveries were made.
 *
 * The throttler implements this via the queue() method, by providing it a task
 * factory. Following the example:
 *
 * 		const throttler = new Throttler();
 * 		const letters = [];
 *
 * 		function deliver() {
 * 			const lettersToDeliver = letters;
 * 			letters = [];
 * 			return makeTheTrip(lettersToDeliver);
 * 		}
 *
 * 		function onLetterReceived(l) {
 * 			letters.push(l);
 * 			throttler.queue(deliver);
 * 		}
 */
export declare class Throttler {
    private activePromise;
    private queuedPromise;
    private queuedPromiseFactory;
    constructor();
    queue<T>(promiseFactory: ITask<Promise<T>>): Promise<T>;
}
export declare class Sequencer {
    private current;
    queue<T>(promiseTask: ITask<Promise<T>>): Promise<T>;
}
/**
 * A helper to delay execution of a task that is being requested often.
 *
 * Following the throttler, now imagine the mail man wants to optimize the number of
 * trips proactively. The trip itself can be long, so he decides not to make the trip
 * as soon as a letter is submitted. Instead he waits a while, in case more
 * letters are submitted. After said waiting period, if no letters were submitted, he
 * decides to make the trip. Imagine that N more letters were submitted after the first
 * one, all within a short period of time between each other. Even though N+1
 * submissions occurred, only 1 delivery was made.
 *
 * The delayer offers this behavior via the trigger() method, into which both the task
 * to be executed and the waiting period (delay) must be passed in as arguments. Following
 * the example:
 *
 * 		const delayer = new Delayer(WAITING_PERIOD);
 * 		const letters = [];
 *
 * 		function letterReceived(l) {
 * 			letters.push(l);
 * 			delayer.trigger(() => { return makeTheTrip(); });
 * 		}
 */
export declare class Delayer<T> implements IDisposable {
    defaultDelay: number;
    private timeout;
    private completionPromise;
    private doResolve;
    private doReject;
    private task;
    constructor(defaultDelay: number);
    trigger(task: ITask<T | Promise<T>>, delay?: number): Promise<T>;
    isTriggered(): boolean;
    cancel(): void;
    private cancelTimeout;
    dispose(): void;
}
/**
 * A helper to delay execution of a task that is being requested often, while
 * preventing accumulation of consecutive executions, while the task runs.
 *
 * The mail man is clever and waits for a certain amount of time, before going
 * out to deliver letters. While the mail man is going out, more letters arrive
 * and can only be delivered once he is back. Once he is back the mail man will
 * do one more trip to deliver the letters that have accumulated while he was out.
 */
export declare class ThrottledDelayer<T> {
    private delayer;
    private throttler;
    constructor(defaultDelay: number);
    trigger(promiseFactory: ITask<Promise<T>>, delay?: number): Promise<T>;
    isTriggered(): boolean;
    cancel(): void;
    dispose(): void;
}
/**
 * A barrier that is initially closed and then becomes opened permanently.
 */
export declare class Barrier {
    private _isOpen;
    private _promise;
    private _completePromise;
    constructor();
    isOpen(): boolean;
    open(): void;
    wait(): Promise<boolean>;
}
export declare function timeout(millis: number): CancelablePromise<void>;
export declare function timeout(millis: number, token: CancellationToken): Promise<void>;
export declare function disposableTimeout(handler: () => void, timeout?: number): IDisposable;
export declare function ignoreErrors<T>(promise: Promise<T>): Promise<T | undefined>;
/**
 * Runs the provided list of promise factories in sequential order. The returned
 * promise will complete to an array of results from each promise.
 */
export declare function sequence<T>(promiseFactories: ITask<Promise<T>>[]): Promise<T[]>;
export declare function first<T>(promiseFactories: ITask<Promise<T>>[], shouldStop?: (t: T) => boolean, defaultValue?: T | null): Promise<T | null>;
/**
 * A helper to queue N promises and run them all with a max degree of parallelism. The helper
 * ensures that at any time no more than M promises are running at the same time.
 */
export declare class Limiter<T> {
    private _size;
    private runningPromises;
    private maxDegreeOfParalellism;
    private outstandingPromises;
    private readonly _onFinished;
    constructor(maxDegreeOfParalellism: number);
    get onFinished(): Event<void>;
    get size(): number;
    queue(factory: ITask<Promise<T>>): Promise<T>;
    private consume;
    private consumed;
    dispose(): void;
}
/**
 * A queue is handles one promise at a time and guarantees that at any time only one promise is executing.
 */
export declare class Queue<T> extends Limiter<T> {
    constructor();
}
/**
 * A helper to organize queues per resource. The ResourceQueue makes sure to manage queues per resource
 * by disposing them once the queue is empty.
 */
export declare class ResourceQueue implements IDisposable {
    private readonly queues;
    queueFor(resource: URI): Queue<void>;
    dispose(): void;
}
export declare class TimeoutTimer implements IDisposable {
    private _token;
    constructor();
    constructor(runner: () => void, timeout: number);
    dispose(): void;
    cancel(): void;
    cancelAndSet(runner: () => void, timeout: number): void;
    setIfNotSet(runner: () => void, timeout: number): void;
}
export declare class IntervalTimer implements IDisposable {
    private _token;
    constructor();
    dispose(): void;
    cancel(): void;
    cancelAndSet(runner: () => void, interval: number): void;
}
export declare class RunOnceScheduler {
    protected runner: ((...args: any[]) => void) | null;
    private timeoutToken;
    private timeout;
    private timeoutHandler;
    constructor(runner: (...args: any[]) => void, timeout: number);
    /**
     * Dispose RunOnceScheduler
     */
    dispose(): void;
    /**
     * Cancel current scheduled runner (if any).
     */
    cancel(): void;
    /**
     * Cancel previous runner (if any) & schedule a new runner.
     */
    schedule(delay?: number): void;
    /**
     * Returns true if scheduled.
     */
    isScheduled(): boolean;
    private onTimeout;
    protected doRun(): void;
}
export declare class RunOnceWorker<T> extends RunOnceScheduler {
    private units;
    constructor(runner: (units: T[]) => void, timeout: number);
    work(unit: T): void;
    protected doRun(): void;
    dispose(): void;
}
export interface IdleDeadline {
    readonly didTimeout: boolean;
    timeRemaining(): number;
}
/**
 * Execute the callback the next time the browser is idle
 */
export declare let runWhenIdle: (callback: (idle: IdleDeadline) => void, timeout?: number) => IDisposable;
/**
 * An implementation of the "idle-until-urgent"-strategy as introduced
 * here: https://philipwalton.com/articles/idle-until-urgent/
 */
export declare class IdleValue<T> {
    private readonly _executor;
    private readonly _handle;
    private _didRun;
    private _value?;
    private _error;
    constructor(executor: () => T);
    dispose(): void;
    get value(): T;
}
export declare function retry<T>(task: ITask<Promise<T>>, delay: number, retries: number): Promise<T>;
export interface ITaskSequentializerWithPendingTask {
    readonly pending: Promise<void>;
}
export declare class TaskSequentializer {
    private _pending?;
    private _next?;
    hasPending(taskId?: number): this is ITaskSequentializerWithPendingTask;
    get pending(): Promise<void> | undefined;
    cancelPending(): void;
    setPending(taskId: number, promise: Promise<void>, onCancel?: () => void): Promise<void>;
    private donePending;
    private triggerNext;
    setNext(run: () => Promise<void>): Promise<void>;
}
export {};
