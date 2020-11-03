import { Event as BaseEvent } from 'vs/base/common/event';
export declare type EventHandler = HTMLElement | HTMLDocument | Window;
export interface IDomEvent {
    <K extends keyof HTMLElementEventMap>(element: EventHandler, type: K, useCapture?: boolean): BaseEvent<HTMLElementEventMap[K]>;
    (element: EventHandler, type: string, useCapture?: boolean): BaseEvent<any>;
}
export declare const domEvent: IDomEvent;
export interface CancellableEvent {
    preventDefault(): void;
    stopPropagation(): void;
}
export declare function stop<T extends CancellableEvent>(event: BaseEvent<T>): BaseEvent<T>;
