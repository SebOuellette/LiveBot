import { Event } from '../common/event';
export declare type EventHandler = HTMLElement | HTMLDocument | Window;
export interface IDomEvent {
    <K extends keyof HTMLElementEventMap>(element: EventHandler, type: K, useCapture?: boolean): Event<HTMLElementEventMap[K]>;
    (element: EventHandler, type: string, useCapture?: boolean): Event<any>;
}
export declare const domEvent: IDomEvent;
export interface CancellableEvent {
    preventDefault(): any;
    stopPropagation(): any;
}
export declare function stop<T extends CancellableEvent>(event: Event<T>): Event<T>;
