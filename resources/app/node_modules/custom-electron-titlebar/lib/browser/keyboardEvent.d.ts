import { KeyCode, SimpleKeybinding } from '../common/keyCodes';
export declare function getCodeForKeyCode(keyCode: KeyCode): number;
export interface IKeyboardEvent {
    readonly browserEvent: KeyboardEvent;
    readonly target: HTMLElement;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
    /**
     * @internal
     */
    toKeybinding(): SimpleKeybinding;
    equals(keybinding: number): boolean;
    preventDefault(): void;
    stopPropagation(): void;
}
export declare class StandardKeyboardEvent implements IKeyboardEvent {
    readonly browserEvent: KeyboardEvent;
    readonly target: HTMLElement;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly keyCode: KeyCode;
    readonly code: string;
    private _asKeybinding;
    private _asRuntimeKeybinding;
    constructor(source: KeyboardEvent);
    preventDefault(): void;
    stopPropagation(): void;
    toKeybinding(): SimpleKeybinding;
    equals(other: number): boolean;
    private _computeKeybinding;
    private _computeRuntimeKeybinding;
}
