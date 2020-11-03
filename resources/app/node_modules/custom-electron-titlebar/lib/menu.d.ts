import { Color } from "./base/common/color";
import { CETMenuItem, IMenuItem } from "./menuitem";
import { Disposable } from "./base/common/lifecycle";
import { Event } from "./base/common/event";
import { MenuItem } from "electron";
export declare const MENU_MNEMONIC_REGEX: RegExp;
export declare const MENU_ESCAPED_MNEMONIC_REGEX: RegExp;
export interface IMenuOptions {
    ariaLabel?: string;
    enableMnemonics?: boolean;
}
export interface IMenuStyle {
    foregroundColor?: Color;
    backgroundColor?: Color;
    selectionForegroundColor?: Color;
    selectionBackgroundColor?: Color;
    separatorColor?: Color;
}
interface ISubMenuData {
    parent: CETMenu;
    submenu?: CETMenu;
}
export declare class CETMenu extends Disposable {
    items: IMenuItem[];
    private focusedItem?;
    private readonly menuContainer;
    private mnemonics;
    private readonly options;
    private readonly closeSubMenu;
    private triggerKeys;
    parentData: ISubMenuData;
    private _onDidCancel;
    get onDidCancel(): Event<void>;
    constructor(container: HTMLElement, options?: IMenuOptions, closeSubMenu?: () => void);
    private isTriggerKeyEvent;
    private updateFocusedItem;
    getContainer(): HTMLElement;
    createMenu(items: MenuItem[]): void;
    focus(index?: number): void;
    focus(selectFirst?: boolean): void;
    private focusNext;
    private focusPrevious;
    private updateFocus;
    private doTrigger;
    private cancel;
    dispose(): void;
    style(style: IMenuStyle): void;
    private focusItemByElement;
    private setFocusedItem;
    setMnemonics(item: CETMenuItem | null): void;
}
export declare function cleanMnemonic(label: string): string;
export {};
