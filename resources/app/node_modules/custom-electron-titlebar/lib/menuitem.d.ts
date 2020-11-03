import { MenuItem } from "electron";
import { EventLike } from "./base/browser/dom";
import { KeyCode } from "./base/common/keyCodes";
import { Disposable } from "./base/common/lifecycle";
import { IMenuOptions, IMenuStyle } from "./menu";
export interface IMenuItem {
    render(element: HTMLElement): void;
    isEnabled(): boolean;
    isSeparator(): boolean;
    focus(): void;
    blur(): void;
    dispose(): void;
}
export declare class CETMenuItem extends Disposable implements IMenuItem {
    protected options: IMenuOptions;
    protected menuStyle: IMenuStyle;
    protected container: HTMLElement;
    protected itemElement: HTMLElement;
    private readonly item;
    private labelElement;
    private checkElement;
    private iconElement;
    private readonly mnemonic;
    private readonly closeSubMenu;
    private event;
    private readonly currentWindow;
    constructor(item: MenuItem, options?: IMenuOptions, closeSubMenu?: () => void);
    getContainer(): HTMLElement;
    isEnabled(): boolean;
    isSeparator(): boolean;
    render(container: HTMLElement): void;
    onClick(event: EventLike): void;
    focus(): void;
    blur(): void;
    setAccelerator(): void;
    updateLabel(): void;
    updateIcon(): void;
    updateTooltip(): void;
    updateEnabled(): void;
    updateVisibility(): void;
    updateChecked(): void;
    dispose(): void;
    getMnemonic(): KeyCode;
    protected applyStyle(): void;
    style(style: IMenuStyle): void;
}
