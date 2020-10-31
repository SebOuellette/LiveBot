"use strict";
/*--------------------------------------------------------------------------------------------------------
 *  This file has been modified by @AlexTorresSk (http://github.com/AlexTorresSk)
 *  to work in custom-electron-titlebar.
 *
 *  The original copy of this file and its respective license are in https://github.com/Microsoft/vscode/
 *
 *  Copyright (c) 2018 Alex Torres
 *  Licensed under the MIT License. See License in the project root for license information.
 *-------------------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const dom_1 = require("./common/dom");
const menu_1 = require("./menu/menu");
const keyboardEvent_1 = require("./browser/keyboardEvent");
const keyCodes_1 = require("./common/keyCodes");
const lifecycle_1 = require("./common/lifecycle");
const event_1 = require("./common/event");
const event_2 = require("./browser/event");
const platform_1 = require("./common/platform");
var MenubarState;
(function (MenubarState) {
    MenubarState[MenubarState["HIDDEN"] = 0] = "HIDDEN";
    MenubarState[MenubarState["VISIBLE"] = 1] = "VISIBLE";
    MenubarState[MenubarState["FOCUSED"] = 2] = "FOCUSED";
    MenubarState[MenubarState["OPEN"] = 3] = "OPEN";
})(MenubarState || (MenubarState = {}));
class Menubar extends lifecycle_1.Disposable {
    constructor(container, options, closeSubMenu = () => { }) {
        super();
        this.container = container;
        this.options = options;
        this.menuItems = [];
        this.mnemonics = new Map();
        this.closeSubMenu = closeSubMenu;
        this._focusState = MenubarState.VISIBLE;
        this._onVisibilityChange = this._register(new event_1.Emitter());
        this._onFocusStateChange = this._register(new event_1.Emitter());
        this._register(ModifierKeyEmitter.getInstance().event(this.onModifierKeyToggled, this));
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.KEY_DOWN, (e) => {
            let event = new keyboardEvent_1.StandardKeyboardEvent(e);
            let eventHandled = true;
            const key = !!e.key ? keyCodes_1.KeyCodeUtils.fromString(e.key) : 0 /* Unknown */;
            if (event.equals(15 /* LeftArrow */)) {
                this.focusPrevious();
            }
            else if (event.equals(17 /* RightArrow */)) {
                this.focusNext();
            }
            else if (event.equals(9 /* Escape */) && this.isFocused && !this.isOpen) {
                this.setUnfocusedState();
            }
            else if (!this.isOpen && !event.ctrlKey && this.options.enableMnemonics && this.mnemonicsInUse && this.mnemonics.has(key)) {
                const menuIndex = this.mnemonics.get(key);
                this.onMenuTriggered(menuIndex, false);
            }
            else {
                eventHandled = false;
            }
            if (eventHandled) {
                event.preventDefault();
                event.stopPropagation();
            }
        }));
        this._register(dom_1.addDisposableListener(window, dom_1.EventType.MOUSE_DOWN, () => {
            // This mouse event is outside the menubar so it counts as a focus out
            if (this.isFocused) {
                this.setUnfocusedState();
            }
        }));
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.FOCUS_IN, (e) => {
            let event = e;
            if (event.relatedTarget) {
                if (!this.container.contains(event.relatedTarget)) {
                    this.focusToReturn = event.relatedTarget;
                }
            }
        }));
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.FOCUS_OUT, (e) => {
            let event = e;
            if (event.relatedTarget) {
                if (!this.container.contains(event.relatedTarget)) {
                    this.focusToReturn = undefined;
                    this.setUnfocusedState();
                }
            }
        }));
        this._register(dom_1.addDisposableListener(window, dom_1.EventType.KEY_DOWN, (e) => {
            if (!this.options.enableMnemonics || !e.altKey || e.ctrlKey || e.defaultPrevented) {
                return;
            }
            const key = keyCodes_1.KeyCodeUtils.fromString(e.key);
            if (!this.mnemonics.has(key)) {
                return;
            }
            this.mnemonicsInUse = true;
            this.updateMnemonicVisibility(true);
            const menuIndex = this.mnemonics.get(key);
            this.onMenuTriggered(menuIndex, false);
        }));
        this.setUnfocusedState();
        this.registerListeners();
    }
    registerListeners() {
        if (!platform_1.isMacintosh) {
            this._register(dom_1.addDisposableListener(window, dom_1.EventType.RESIZE, () => {
                this.blur();
            }));
        }
    }
    setupMenubar() {
        const topLevelMenus = this.options.menu.items;
        this._register(this.onFocusStateChange(e => this._onFocusStateChange.fire(e)));
        this._register(this.onVisibilityChange(e => this._onVisibilityChange.fire(e)));
        topLevelMenus.forEach((menubarMenu) => {
            const menuIndex = this.menuItems.length;
            const cleanMenuLabel = menu_1.cleanMnemonic(menubarMenu.label);
            const buttonElement = dom_1.$('div.menubar-menu-button', { 'role': 'menuitem', 'tabindex': -1, 'aria-label': cleanMenuLabel, 'aria-haspopup': true });
            if (!menubarMenu.enabled) {
                dom_1.addClass(buttonElement, 'disabled');
            }
            const titleElement = dom_1.$('div.menubar-menu-title', { 'role': 'none', 'aria-hidden': true });
            buttonElement.appendChild(titleElement);
            dom_1.append(this.container, buttonElement);
            let mnemonicMatches = menu_1.MENU_MNEMONIC_REGEX.exec(menubarMenu.label);
            // Register mnemonics
            if (mnemonicMatches) {
                let mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[2];
                this.registerMnemonic(this.menuItems.length, mnemonic);
            }
            this.updateLabels(titleElement, buttonElement, menubarMenu.label);
            if (menubarMenu.enabled) {
                this._register(dom_1.addDisposableListener(buttonElement, dom_1.EventType.KEY_UP, (e) => {
                    let event = new keyboardEvent_1.StandardKeyboardEvent(e);
                    let eventHandled = true;
                    if ((event.equals(18 /* DownArrow */) || event.equals(3 /* Enter */)) && !this.isOpen) {
                        this.focusedMenu = { index: menuIndex };
                        this.openedViaKeyboard = true;
                        this.focusState = MenubarState.OPEN;
                    }
                    else {
                        eventHandled = false;
                    }
                    if (eventHandled) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }));
                this._register(dom_1.addDisposableListener(buttonElement, dom_1.EventType.MOUSE_DOWN, (e) => {
                    if (!this.isOpen) {
                        // Open the menu with mouse down and ignore the following mouse up event
                        this.ignoreNextMouseUp = true;
                        this.onMenuTriggered(menuIndex, true);
                    }
                    else {
                        this.ignoreNextMouseUp = false;
                    }
                    e.preventDefault();
                    e.stopPropagation();
                }));
                this._register(dom_1.addDisposableListener(buttonElement, dom_1.EventType.MOUSE_UP, () => {
                    if (!this.ignoreNextMouseUp) {
                        if (this.isFocused) {
                            this.onMenuTriggered(menuIndex, true);
                        }
                    }
                    else {
                        this.ignoreNextMouseUp = false;
                    }
                }));
                this._register(dom_1.addDisposableListener(buttonElement, dom_1.EventType.MOUSE_ENTER, () => {
                    if (this.isOpen && !this.isCurrentMenu(menuIndex)) {
                        this.menuItems[menuIndex].buttonElement.focus();
                        this.cleanupMenu();
                        if (this.menuItems[menuIndex].submenu) {
                            this.showMenu(menuIndex, false);
                        }
                    }
                    else if (this.isFocused && !this.isOpen) {
                        this.focusedMenu = { index: menuIndex };
                        buttonElement.focus();
                    }
                }));
                this.menuItems.push({
                    menuItem: menubarMenu,
                    submenu: menubarMenu.submenu,
                    buttonElement: buttonElement,
                    titleElement: titleElement
                });
            }
        });
    }
    onClick(menuIndex) {
        let electronEvent;
        const item = this.menuItems[menuIndex].menuItem;
        if (item.click) {
            item.click(item, electron_1.remote.getCurrentWindow(), electronEvent);
        }
    }
    get onVisibilityChange() {
        return this._onVisibilityChange.event;
    }
    get onFocusStateChange() {
        return this._onFocusStateChange.event;
    }
    dispose() {
        super.dispose();
        this.menuItems.forEach(menuBarMenu => {
            dom_1.removeNode(menuBarMenu.titleElement);
            dom_1.removeNode(menuBarMenu.buttonElement);
        });
    }
    blur() {
        this.setUnfocusedState();
    }
    setStyles(style) {
        this.menuStyle = style;
    }
    updateLabels(titleElement, buttonElement, label) {
        const cleanMenuLabel = menu_1.cleanMnemonic(label);
        // Update the button label to reflect mnemonics
        if (this.options.enableMnemonics) {
            let innerHtml = escape(label);
            // This is global so reset it
            menu_1.MENU_ESCAPED_MNEMONIC_REGEX.lastIndex = 0;
            let escMatch = menu_1.MENU_ESCAPED_MNEMONIC_REGEX.exec(innerHtml);
            // We can't use negative lookbehind so we match our negative and skip
            while (escMatch && escMatch[1]) {
                escMatch = menu_1.MENU_ESCAPED_MNEMONIC_REGEX.exec(innerHtml);
            }
            if (escMatch) {
                innerHtml = `${innerHtml.substr(0, escMatch.index)}<mnemonic aria-hidden="true">${escMatch[3]}</mnemonic>${innerHtml.substr(escMatch.index + escMatch[0].length)}`;
            }
            innerHtml = innerHtml.replace(/&amp;&amp;/g, '&amp;');
            titleElement.innerHTML = innerHtml;
        }
        else {
            titleElement.innerHTML = cleanMenuLabel.replace(/&&/g, '&');
        }
        let mnemonicMatches = menu_1.MENU_MNEMONIC_REGEX.exec(label);
        // Register mnemonics
        if (mnemonicMatches) {
            let mnemonic = !!mnemonicMatches[1] ? mnemonicMatches[1] : mnemonicMatches[3];
            if (this.options.enableMnemonics) {
                buttonElement.setAttribute('aria-keyshortcuts', 'Alt+' + mnemonic.toLocaleLowerCase());
            }
            else {
                buttonElement.removeAttribute('aria-keyshortcuts');
            }
        }
    }
    registerMnemonic(menuIndex, mnemonic) {
        this.mnemonics.set(keyCodes_1.KeyCodeUtils.fromString(mnemonic), menuIndex);
    }
    hideMenubar() {
        if (this.container.style.display !== 'none') {
            this.container.style.display = 'none';
        }
    }
    showMenubar() {
        if (this.container.style.display !== 'flex') {
            this.container.style.display = 'flex';
        }
    }
    get focusState() {
        return this._focusState;
    }
    set focusState(value) {
        if (value === this._focusState) {
            return;
        }
        const isVisible = this.isVisible;
        const isOpen = this.isOpen;
        const isFocused = this.isFocused;
        this._focusState = value;
        switch (value) {
            case MenubarState.HIDDEN:
                if (isVisible) {
                    this.hideMenubar();
                }
                if (isOpen) {
                    this.cleanupMenu();
                }
                if (isFocused) {
                    this.focusedMenu = undefined;
                    if (this.focusToReturn) {
                        this.focusToReturn.focus();
                        this.focusToReturn = undefined;
                    }
                }
                break;
            case MenubarState.VISIBLE:
                if (!isVisible) {
                    this.showMenubar();
                }
                if (isOpen) {
                    this.cleanupMenu();
                }
                if (isFocused) {
                    if (this.focusedMenu) {
                        this.menuItems[this.focusedMenu.index].buttonElement.blur();
                    }
                    this.focusedMenu = undefined;
                    if (this.focusToReturn) {
                        this.focusToReturn.focus();
                        this.focusToReturn = undefined;
                    }
                }
                break;
            case MenubarState.FOCUSED:
                if (!isVisible) {
                    this.showMenubar();
                }
                if (isOpen) {
                    this.cleanupMenu();
                }
                if (this.focusedMenu) {
                    this.menuItems[this.focusedMenu.index].buttonElement.focus();
                }
                break;
            case MenubarState.OPEN:
                if (!isVisible) {
                    this.showMenubar();
                }
                if (this.focusedMenu) {
                    if (this.menuItems[this.focusedMenu.index].submenu) {
                        this.showMenu(this.focusedMenu.index, this.openedViaKeyboard);
                    }
                }
                break;
        }
        this._focusState = value;
    }
    get isVisible() {
        return this.focusState >= MenubarState.VISIBLE;
    }
    get isFocused() {
        return this.focusState >= MenubarState.FOCUSED;
    }
    get isOpen() {
        return this.focusState >= MenubarState.OPEN;
    }
    setUnfocusedState() {
        this.focusState = MenubarState.VISIBLE;
        this.ignoreNextMouseUp = false;
        this.mnemonicsInUse = false;
        this.updateMnemonicVisibility(false);
    }
    focusPrevious() {
        if (!this.focusedMenu) {
            return;
        }
        let newFocusedIndex = (this.focusedMenu.index - 1 + this.menuItems.length) % this.menuItems.length;
        if (newFocusedIndex === this.focusedMenu.index) {
            return;
        }
        if (this.isOpen) {
            this.cleanupMenu();
            if (this.menuItems[newFocusedIndex].submenu) {
                this.showMenu(newFocusedIndex);
            }
        }
        else if (this.isFocused) {
            this.focusedMenu.index = newFocusedIndex;
            this.menuItems[newFocusedIndex].buttonElement.focus();
        }
    }
    focusNext() {
        if (!this.focusedMenu) {
            return;
        }
        let newFocusedIndex = (this.focusedMenu.index + 1) % this.menuItems.length;
        if (newFocusedIndex === this.focusedMenu.index) {
            return;
        }
        if (this.isOpen) {
            this.cleanupMenu();
            if (this.menuItems[newFocusedIndex].submenu) {
                this.showMenu(newFocusedIndex);
            }
        }
        else if (this.isFocused) {
            this.focusedMenu.index = newFocusedIndex;
            this.menuItems[newFocusedIndex].buttonElement.focus();
        }
    }
    updateMnemonicVisibility(visible) {
        if (this.menuItems) {
            this.menuItems.forEach(menuBarMenu => {
                if (menuBarMenu.titleElement.children.length) {
                    let child = menuBarMenu.titleElement.children.item(0);
                    if (child) {
                        child.style.textDecoration = visible ? 'underline' : null;
                    }
                }
            });
        }
    }
    get mnemonicsInUse() {
        return this._mnemonicsInUse;
    }
    set mnemonicsInUse(value) {
        this._mnemonicsInUse = value;
    }
    onMenuTriggered(menuIndex, clicked) {
        if (this.isOpen) {
            if (this.isCurrentMenu(menuIndex)) {
                this.setUnfocusedState();
            }
            else {
                this.cleanupMenu();
                if (this.menuItems[menuIndex].submenu) {
                    this.showMenu(menuIndex, this.openedViaKeyboard);
                }
                else {
                    if (this.menuItems[menuIndex].menuItem.enabled) {
                        this.onClick(menuIndex);
                    }
                }
            }
        }
        else {
            this.focusedMenu = { index: menuIndex };
            this.openedViaKeyboard = !clicked;
            if (this.menuItems[menuIndex].submenu) {
                this.focusState = MenubarState.OPEN;
            }
            else {
                if (this.menuItems[menuIndex].menuItem.enabled) {
                    this.onClick(menuIndex);
                }
            }
        }
    }
    onModifierKeyToggled(modifierKeyStatus) {
        const allModifiersReleased = !modifierKeyStatus.altKey && !modifierKeyStatus.ctrlKey && !modifierKeyStatus.shiftKey;
        // Alt key pressed while menu is focused. This should return focus away from the menubar
        if (this.isFocused && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.altKey) {
            this.setUnfocusedState();
            this.mnemonicsInUse = false;
            this.awaitingAltRelease = true;
        }
        // Clean alt key press and release
        if (allModifiersReleased && modifierKeyStatus.lastKeyPressed === 'alt' && modifierKeyStatus.lastKeyReleased === 'alt') {
            if (!this.awaitingAltRelease) {
                if (!this.isFocused) {
                    this.mnemonicsInUse = true;
                    this.focusedMenu = { index: 0 };
                    this.focusState = MenubarState.FOCUSED;
                }
                else if (!this.isOpen) {
                    this.setUnfocusedState();
                }
            }
        }
        // Alt key released
        if (!modifierKeyStatus.altKey && modifierKeyStatus.lastKeyReleased === 'alt') {
            this.awaitingAltRelease = false;
        }
        if (this.options.enableMnemonics && this.menuItems && !this.isOpen) {
            this.updateMnemonicVisibility((!this.awaitingAltRelease && modifierKeyStatus.altKey) || this.mnemonicsInUse);
        }
    }
    isCurrentMenu(menuIndex) {
        if (!this.focusedMenu) {
            return false;
        }
        return this.focusedMenu.index === menuIndex;
    }
    cleanupMenu() {
        if (this.focusedMenu) {
            // Remove focus from the menus first
            this.menuItems[this.focusedMenu.index].buttonElement.focus();
            if (this.focusedMenu.holder) {
                if (this.focusedMenu.holder.parentElement) {
                    dom_1.removeClass(this.focusedMenu.holder.parentElement, 'open');
                }
                this.focusedMenu.holder.remove();
            }
            if (this.focusedMenu.widget) {
                this.focusedMenu.widget.dispose();
            }
            this.focusedMenu = { index: this.focusedMenu.index };
        }
    }
    showMenu(menuIndex, selectFirst = true) {
        const customMenu = this.menuItems[menuIndex];
        const menuHolder = dom_1.$('ul.menubar-menu-container');
        dom_1.addClass(customMenu.buttonElement, 'open');
        menuHolder.setAttribute('role', 'menu');
        menuHolder.tabIndex = 0;
        menuHolder.style.top = `${customMenu.buttonElement.getBoundingClientRect().bottom}px`;
        menuHolder.style.left = `${customMenu.buttonElement.getBoundingClientRect().left}px`;
        customMenu.buttonElement.appendChild(menuHolder);
        let menuOptions = {
            enableMnemonics: this.mnemonicsInUse && this.options.enableMnemonics,
            ariaLabel: customMenu.buttonElement.attributes['aria-label'].value
        };
        let menuWidget = new menu_1.CETMenu(menuHolder, menuOptions, this.closeSubMenu);
        menuWidget.createMenu(customMenu.submenu.items);
        menuWidget.style(this.menuStyle);
        this._register(menuWidget.onDidCancel(() => {
            this.focusState = MenubarState.FOCUSED;
        }));
        menuWidget.focus(selectFirst);
        this.focusedMenu = {
            index: menuIndex,
            holder: menuHolder,
            widget: menuWidget
        };
    }
}
exports.Menubar = Menubar;
class ModifierKeyEmitter extends event_1.Emitter {
    constructor() {
        super();
        this._subscriptions = [];
        this._keyStatus = {
            altKey: false,
            shiftKey: false,
            ctrlKey: false
        };
        this._subscriptions.push(event_2.domEvent(document.body, 'keydown', true)(e => {
            const event = new keyboardEvent_1.StandardKeyboardEvent(e);
            if (e.altKey && !this._keyStatus.altKey) {
                this._keyStatus.lastKeyPressed = 'alt';
            }
            else if (e.ctrlKey && !this._keyStatus.ctrlKey) {
                this._keyStatus.lastKeyPressed = 'ctrl';
            }
            else if (e.shiftKey && !this._keyStatus.shiftKey) {
                this._keyStatus.lastKeyPressed = 'shift';
            }
            else if (event.keyCode !== 6 /* Alt */) {
                this._keyStatus.lastKeyPressed = undefined;
            }
            else {
                return;
            }
            this._keyStatus.altKey = e.altKey;
            this._keyStatus.ctrlKey = e.ctrlKey;
            this._keyStatus.shiftKey = e.shiftKey;
            if (this._keyStatus.lastKeyPressed) {
                this.fire(this._keyStatus);
            }
        }));
        this._subscriptions.push(event_2.domEvent(document.body, 'keyup', true)(e => {
            if (!e.altKey && this._keyStatus.altKey) {
                this._keyStatus.lastKeyReleased = 'alt';
            }
            else if (!e.ctrlKey && this._keyStatus.ctrlKey) {
                this._keyStatus.lastKeyReleased = 'ctrl';
            }
            else if (!e.shiftKey && this._keyStatus.shiftKey) {
                this._keyStatus.lastKeyReleased = 'shift';
            }
            else {
                this._keyStatus.lastKeyReleased = undefined;
            }
            if (this._keyStatus.lastKeyPressed !== this._keyStatus.lastKeyReleased) {
                this._keyStatus.lastKeyPressed = undefined;
            }
            this._keyStatus.altKey = e.altKey;
            this._keyStatus.ctrlKey = e.ctrlKey;
            this._keyStatus.shiftKey = e.shiftKey;
            if (this._keyStatus.lastKeyReleased) {
                this.fire(this._keyStatus);
            }
        }));
        this._subscriptions.push(event_2.domEvent(document.body, 'mousedown', true)(e => {
            this._keyStatus.lastKeyPressed = undefined;
        }));
        this._subscriptions.push(event_2.domEvent(window, 'blur')(e => {
            this._keyStatus.lastKeyPressed = undefined;
            this._keyStatus.lastKeyReleased = undefined;
            this._keyStatus.altKey = false;
            this._keyStatus.shiftKey = false;
            this._keyStatus.shiftKey = false;
            this.fire(this._keyStatus);
        }));
    }
    static getInstance() {
        if (!ModifierKeyEmitter.instance) {
            ModifierKeyEmitter.instance = new ModifierKeyEmitter();
        }
        return ModifierKeyEmitter.instance;
    }
    dispose() {
        super.dispose();
        this._subscriptions = lifecycle_1.dispose(this._subscriptions);
    }
}
function escape(html) {
    return html.replace(/[<>&]/g, function (match) {
        switch (match) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            default: return match;
        }
    });
}
exports.escape = escape;
