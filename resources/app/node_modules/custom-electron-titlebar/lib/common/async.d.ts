import { Disposable } from './lifecycle';
export declare class TimeoutTimer extends Disposable {
    private _token;
    constructor();
    constructor(runner: () => void, timeout: number);
    dispose(): void;
    cancel(): void;
    cancelAndSet(runner: () => void, timeout: number): void;
    setIfNotSet(runner: () => void, timeout: number): void;
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
