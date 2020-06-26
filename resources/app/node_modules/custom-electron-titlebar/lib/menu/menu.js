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
const dom_1 = require("../common/dom");
const keyCodes_1 = require("../common/keyCodes");
const platform_1 = require("../common/platform");
const keyboardEvent_1 = require("../browser/keyboardEvent");
const menuitem_1 = require("./menuitem");
const lifecycle_1 = require("../common/lifecycle");
const event_1 = require("../common/event");
const async_1 = require("../common/async");
exports.MENU_MNEMONIC_REGEX = /\(&{1,2}(.)\)|&{1,2}(.)/;
exports.MENU_ESCAPED_MNEMONIC_REGEX = /(?:&amp;){1,2}(.)/;
class CETMenu extends lifecycle_1.Disposable {
    constructor(container, options = {}, closeSubMenu = () => { }) {
        super();
        this.triggerKeys = {
            keys: [3 /* Enter */, 10 /* Space */],
            keyDown: true
        };
        this.parentData = {
            parent: this
        };
        this._onDidCancel = this._register(new event_1.Emitter());
        this.menuContainer = container;
        this.options = options;
        this.closeSubMenu = closeSubMenu;
        this.items = [];
        this.focusedItem = undefined;
        this.mnemonics = new Map();
        this._register(dom_1.addDisposableListener(this.menuContainer, dom_1.EventType.KEY_DOWN, e => {
            const event = new keyboardEvent_1.StandardKeyboardEvent(e);
            let eventHandled = true;
            if (event.equals(16 /* UpArrow */)) {
                this.focusPrevious();
            }
            else if (event.equals(18 /* DownArrow */)) {
                this.focusNext();
            }
            else if (event.equals(9 /* Escape */)) {
                this.cancel();
            }
            else if (this.isTriggerKeyEvent(event)) {
                // Staying out of the else branch even if not triggered
                if (this.triggerKeys && this.triggerKeys.keyDown) {
                    this.doTrigger(event);
                }
            }
            else {
                eventHandled = false;
            }
            if (eventHandled) {
                event.preventDefault();
                event.stopPropagation();
            }
        }));
        this._register(dom_1.addDisposableListener(this.menuContainer, dom_1.EventType.KEY_UP, e => {
            const event = new keyboardEvent_1.StandardKeyboardEvent(e);
            // Run action on Enter/Space
            if (this.isTriggerKeyEvent(event)) {
                if (this.triggerKeys && !this.triggerKeys.keyDown) {
                    this.doTrigger(event);
                }
                event.preventDefault();
                event.stopPropagation();
            }
            // Recompute focused item
            else if (event.equals(2 /* Tab */) || event.equals(1024 /* Shift */ | 2 /* Tab */)) {
                this.updateFocusedItem();
            }
        }));
        if (options.enableMnemonics) {
            this._register(dom_1.addDisposableListener(this.menuContainer, dom_1.EventType.KEY_DOWN, (e) => {
                const key = keyCodes_1.KeyCodeUtils.fromString(e.key);
                if (this.mnemonics.has(key)) {
                    const items = this.mnemonics.get(key);
                    if (items.length === 1) {
                        if (items[0] instanceof Submenu) {
                            this.focusItemByElement(items[0].getContainer());
                        }
                        items[0].onClick(e);
                    }
                    if (items.length > 1) {
                        const item = items.shift();
                        if (item) {
                            this.focusItemByElement(item.getContainer());
                            items.push(item);
                        }
                        this.mnemonics.set(key, items);
                    }
                }
            }));
        }
        if (platform_1.isLinux) {
            this._register(dom_1.addDisposableListener(this.menuContainer, dom_1.EventType.KEY_DOWN, e => {
                const event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(14 /* Home */) || event.equals(11 /* PageUp */)) {
                    this.focusedItem = this.items.length - 1;
                    this.focusNext();
                    dom_1.EventHelper.stop(e, true);
                }
                else if (event.equals(13 /* End */) || event.equals(12 /* PageDown */)) {
                    this.focusedItem = 0;
                    this.focusPrevious();
                    dom_1.EventHelper.stop(e, true);
                }
            }));
        }
        this._register(dom_1.addDisposableListener(this.menuContainer, dom_1.EventType.MOUSE_OUT, e => {
            let relatedTarget = e.relatedTarget;
            if (!dom_1.isAncestor(relatedTarget, this.menuContainer)) {
                this.focusedItem = undefined;
                this.updateFocus();
                e.stopPropagation();
            }
        }));
        this._register(dom_1.addDisposableListener(this.menuContainer, dom_1.EventType.MOUSE_UP, e => {
            // Absorb clicks in menu dead space https://github.com/Microsoft/vscode/issues/63575
            dom_1.EventHelper.stop(e, true);
        }));
        this._register(dom_1.addDisposableListener(this.menuContainer, dom_1.EventType.MOUSE_OVER, e => {
            let target = e.target;
            if (!target || !dom_1.isAncestor(target, this.menuContainer) || target === this.menuContainer) {
                return;
            }
            while (target.parentElement !== this.menuContainer && target.parentElement !== null) {
                target = target.parentElement;
            }
            if (dom_1.hasClass(target, 'action-item')) {
                const lastFocusedItem = this.focusedItem;
                this.setFocusedItem(target);
                if (lastFocusedItem !== this.focusedItem) {
                    this.updateFocus();
                }
            }
        }));
        if (this.options.ariaLabel) {
            this.menuContainer.setAttribute('aria-label', this.options.ariaLabel);
        }
        //container.style.maxHeight = `${Math.max(10, window.innerHeight - container.getBoundingClientRect().top - 70)}px`;
    }
    get onDidCancel() { return this._onDidCancel.event; }
    setAriaLabel(label) {
        if (label) {
            this.menuContainer.setAttribute('aria-label', label);
        }
        else {
            this.menuContainer.removeAttribute('aria-label');
        }
    }
    isTriggerKeyEvent(event) {
        let ret = false;
        if (this.triggerKeys) {
            this.triggerKeys.keys.forEach(keyCode => {
                ret = ret || event.equals(keyCode);
            });
        }
        return ret;
    }
    updateFocusedItem() {
        for (let i = 0; i < this.menuContainer.children.length; i++) {
            const elem = this.menuContainer.children[i];
            if (dom_1.isAncestor(document.activeElement, elem)) {
                this.focusedItem = i;
                break;
            }
        }
    }
    getContainer() {
        return this.menuContainer;
    }
    createMenu(items) {
        items.forEach((menuItem) => {
            const itemElement = document.createElement('li');
            itemElement.className = 'action-item';
            itemElement.setAttribute('role', 'presentation');
            // Prevent native context menu on actions
            this._register(dom_1.addDisposableListener(itemElement, dom_1.EventType.CONTEXT_MENU, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }));
            let item = null;
            if (menuItem.type === 'separator') {
                item = new Separator(menuItem, this.options);
            }
            else if (menuItem.type === 'submenu' || menuItem.submenu) {
                const submenuItems = menuItem.submenu.items;
                item = new Submenu(menuItem, submenuItems, this.parentData, this.options);
                if (this.options.enableMnemonics) {
                    const mnemonic = item.getMnemonic();
                    if (mnemonic && item.isEnabled()) {
                        let actionItems = [];
                        if (this.mnemonics.has(mnemonic)) {
                            actionItems = this.mnemonics.get(mnemonic);
                        }
                        actionItems.push(item);
                        this.mnemonics.set(mnemonic, actionItems);
                    }
                }
            }
            else {
                const menuItemOptions = { enableMnemonics: this.options.enableMnemonics };
                item = new menuitem_1.CETMenuItem(menuItem, menuItemOptions, this.closeSubMenu);
                if (this.options.enableMnemonics) {
                    const mnemonic = item.getMnemonic();
                    if (mnemonic && item.isEnabled()) {
                        let actionItems = [];
                        if (this.mnemonics.has(mnemonic)) {
                            actionItems = this.mnemonics.get(mnemonic);
                        }
                        actionItems.push(item);
                        this.mnemonics.set(mnemonic, actionItems);
                    }
                }
            }
            item.render(itemElement);
            this.menuContainer.appendChild(itemElement);
            this.items.push(item);
        });
    }
    focus(arg) {
        let selectFirst = false;
        let index = undefined;
        if (arg === undefined) {
            selectFirst = true;
        }
        else if (typeof arg === 'number') {
            index = arg;
        }
        else if (typeof arg === 'boolean') {
            selectFirst = arg;
        }
        if (selectFirst && typeof this.focusedItem === 'undefined') {
            // Focus the first enabled item
            this.focusedItem = this.items.length - 1;
            this.focusNext();
        }
        else {
            if (index !== undefined) {
                this.focusedItem = index;
            }
            this.updateFocus();
        }
    }
    focusNext() {
        if (typeof this.focusedItem === 'undefined') {
            this.focusedItem = this.items.length - 1;
        }
        const startIndex = this.focusedItem;
        let item;
        do {
            this.focusedItem = (this.focusedItem + 1) % this.items.length;
            item = this.items[this.focusedItem];
        } while ((this.focusedItem !== startIndex && !item.isEnabled()) || item.isSeparator());
        if ((this.focusedItem === startIndex && !item.isEnabled()) || item.isSeparator()) {
            this.focusedItem = undefined;
        }
        this.updateFocus();
    }
    focusPrevious() {
        if (typeof this.focusedItem === 'undefined') {
            this.focusedItem = 0;
        }
        const startIndex = this.focusedItem;
        let item;
        do {
            this.focusedItem = this.focusedItem - 1;
            if (this.focusedItem < 0) {
                this.focusedItem = this.items.length - 1;
            }
            item = this.items[this.focusedItem];
        } while ((this.focusedItem !== startIndex && !item.isEnabled()) || item.isSeparator());
        if ((this.focusedItem === startIndex && !item.isEnabled()) || item.isSeparator()) {
            this.focusedItem = undefined;
        }
        this.updateFocus();
    }
    updateFocus() {
        if (typeof this.focusedItem === 'undefined') {
            this.menuContainer.focus();
        }
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (i === this.focusedItem) {
                if (item.isEnabled()) {
                    item.focus();
                }
                else {
                    this.menuContainer.focus();
                }
            }
            else {
                item.blur();
            }
        }
    }
    doTrigger(event) {
        if (typeof this.focusedItem === 'undefined') {
            return; //nothing to focus
        }
        // trigger action
        const item = this.items[this.focusedItem];
        if (item instanceof menuitem_1.CETMenuItem) {
            item.onClick(event);
        }
    }
    cancel() {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur(); // remove focus from focused action
        }
        this._onDidCancel.fire();
    }
    dispose() {
        lifecycle_1.dispose(this.items);
        this.items = [];
        dom_1.removeNode(this.getContainer());
        super.dispose();
    }
    style(style) {
        const container = this.getContainer();
        container.style.backgroundColor = style.backgroundColor ? style.backgroundColor.toString() : null;
        if (this.items) {
            this.items.forEach(item => {
                if (item instanceof menuitem_1.CETMenuItem || item instanceof Separator) {
                    item.style(style);
                }
            });
        }
    }
    focusItemByElement(element) {
        const lastFocusedItem = this.focusedItem;
        this.setFocusedItem(element);
        if (lastFocusedItem !== this.focusedItem) {
            this.updateFocus();
        }
    }
    setFocusedItem(element) {
        for (let i = 0; i < this.menuContainer.children.length; i++) {
            let elem = this.menuContainer.children[i];
            if (element === elem) {
                this.focusedItem = i;
                break;
            }
        }
    }
}
exports.CETMenu = CETMenu;
class Submenu extends menuitem_1.CETMenuItem {
    constructor(item, submenuItems, parentData, submenuOptions) {
        super(item, submenuOptions);
        this.submenuItems = submenuItems;
        this.parentData = parentData;
        this.submenuOptions = submenuOptions;
        this.submenuDisposables = [];
        this.showScheduler = new async_1.RunOnceScheduler(() => {
            if (this.mouseOver) {
                this.cleanupExistingSubmenu(false);
                this.createSubmenu(false);
            }
        }, 250);
        this.hideScheduler = new async_1.RunOnceScheduler(() => {
            if (this.container && (!dom_1.isAncestor(document.activeElement, this.container) && this.parentData.submenu === this.mysubmenu)) {
                this.parentData.parent.focus(false);
                this.cleanupExistingSubmenu(true);
            }
        }, 750);
    }
    render(container) {
        super.render(container);
        if (!this.itemElement) {
            return;
        }
        dom_1.addClass(this.itemElement, 'submenu-item');
        this.itemElement.setAttribute('aria-haspopup', 'true');
        this.submenuIndicator = dom_1.append(this.itemElement, dom_1.$('span.submenu-indicator'));
        this.submenuIndicator.setAttribute('aria-hidden', 'true');
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.KEY_UP, e => {
            let event = new keyboardEvent_1.StandardKeyboardEvent(e);
            if (event.equals(17 /* RightArrow */) || event.equals(3 /* Enter */)) {
                dom_1.EventHelper.stop(e, true);
                this.createSubmenu(true);
            }
        }));
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.KEY_DOWN, e => {
            let event = new keyboardEvent_1.StandardKeyboardEvent(e);
            if (event.equals(17 /* RightArrow */) || event.equals(3 /* Enter */)) {
                dom_1.EventHelper.stop(e, true);
            }
        }));
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.MOUSE_OVER, e => {
            if (!this.mouseOver) {
                this.mouseOver = true;
                this.showScheduler.schedule();
            }
        }));
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.MOUSE_LEAVE, e => {
            this.mouseOver = false;
        }));
        this._register(dom_1.addDisposableListener(this.container, dom_1.EventType.FOCUS_OUT, e => {
            if (this.container && !dom_1.isAncestor(document.activeElement, this.container)) {
                this.hideScheduler.schedule();
            }
        }));
    }
    onClick(e) {
        // stop clicking from trying to run an action
        dom_1.EventHelper.stop(e, true);
        this.cleanupExistingSubmenu(false);
        this.createSubmenu(false);
    }
    cleanupExistingSubmenu(force) {
        if (this.parentData.submenu && (force || (this.parentData.submenu !== this.mysubmenu))) {
            this.parentData.submenu.dispose();
            this.parentData.submenu = undefined;
            if (this.submenuContainer) {
                this.submenuContainer = undefined;
            }
        }
    }
    createSubmenu(selectFirstItem = true) {
        if (!this.itemElement) {
            return;
        }
        if (!this.parentData.submenu) {
            this.submenuContainer = dom_1.append(this.container, dom_1.$('ul.submenu'));
            dom_1.addClasses(this.submenuContainer, 'menubar-menu-container');
            this.parentData.submenu = new CETMenu(this.submenuContainer, this.submenuOptions);
            this.parentData.submenu.createMenu(this.submenuItems);
            if (this.menuStyle) {
                this.parentData.submenu.style(this.menuStyle);
            }
            const boundingRect = this.container.getBoundingClientRect();
            const childBoundingRect = this.submenuContainer.getBoundingClientRect();
            const computedStyles = getComputedStyle(this.parentData.parent.getContainer());
            const paddingTop = parseFloat(computedStyles.paddingTop || '0') || 0;
            if (window.innerWidth <= boundingRect.right + childBoundingRect.width) {
                this.submenuContainer.style.left = '10px';
                this.submenuContainer.style.top = `${this.container.offsetTop + boundingRect.height}px`;
            }
            else {
                this.submenuContainer.style.left = `${this.container.offsetWidth}px`;
                this.submenuContainer.style.top = `${this.container.offsetTop - paddingTop}px`;
            }
            this.submenuDisposables.push(dom_1.addDisposableListener(this.submenuContainer, dom_1.EventType.KEY_UP, e => {
                let event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* LeftArrow */)) {
                    dom_1.EventHelper.stop(e, true);
                    this.parentData.parent.focus();
                    if (this.parentData.submenu) {
                        this.parentData.submenu.dispose();
                        this.parentData.submenu = undefined;
                    }
                    this.submenuDisposables = lifecycle_1.dispose(this.submenuDisposables);
                    this.submenuContainer = undefined;
                }
            }));
            this.submenuDisposables.push(dom_1.addDisposableListener(this.submenuContainer, dom_1.EventType.KEY_DOWN, e => {
                let event = new keyboardEvent_1.StandardKeyboardEvent(e);
                if (event.equals(15 /* LeftArrow */)) {
                    dom_1.EventHelper.stop(e, true);
                }
            }));
            this.submenuDisposables.push(this.parentData.submenu.onDidCancel(() => {
                this.parentData.parent.focus();
                if (this.parentData.submenu) {
                    this.parentData.submenu.dispose();
                    this.parentData.submenu = undefined;
                }
                this.submenuDisposables = lifecycle_1.dispose(this.submenuDisposables);
                this.submenuContainer = undefined;
            }));
            this.parentData.submenu.focus(selectFirstItem);
            this.mysubmenu = this.parentData.submenu;
        }
        else {
            this.parentData.submenu.focus(false);
        }
    }
    applyStyle() {
        super.applyStyle();
        if (!this.menuStyle) {
            return;
        }
        const isSelected = this.container && dom_1.hasClass(this.container, 'focused');
        const fgColor = isSelected && this.menuStyle.selectionForegroundColor ? this.menuStyle.selectionForegroundColor : this.menuStyle.foregroundColor;
        this.submenuIndicator.style.backgroundColor = fgColor ? `${fgColor}` : null;
        if (this.parentData.submenu) {
            this.parentData.submenu.style(this.menuStyle);
        }
    }
    dispose() {
        super.dispose();
        this.hideScheduler.dispose();
        if (this.mysubmenu) {
            this.mysubmenu.dispose();
            this.mysubmenu = null;
        }
        if (this.submenuContainer) {
            this.submenuDisposables = lifecycle_1.dispose(this.submenuDisposables);
            this.submenuContainer = undefined;
        }
    }
}
class Separator extends menuitem_1.CETMenuItem {
    constructor(item, options) {
        super(item, options);
    }
    render(container) {
        if (container) {
            this.separatorElement = dom_1.append(container, dom_1.$('a.action-label'));
            this.separatorElement.setAttribute('role', 'presentation');
            dom_1.addClass(this.separatorElement, 'separator');
        }
    }
    style(style) {
        this.separatorElement.style.borderBottomColor = style.separatorColor ? `${style.separatorColor}` : null;
    }
}
function cleanMnemonic(label) {
    const regex = exports.MENU_MNEMONIC_REGEX;
    const matches = regex.exec(label);
    if (!matches) {
        return label;
    }
    const mnemonicInText = matches[0].charAt(0) === '&';
    return label.replace(regex, mnemonicInText ? '$2' : '').trim();
}
exports.cleanMnemonic = cleanMnemonic;
