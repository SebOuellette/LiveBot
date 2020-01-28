"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const browser = require("./browser");
const iframe_1 = require("./iframe");
const platform = require("../common/platform");
class StandardMouseEvent {
    constructor(e) {
        this.timestamp = Date.now();
        this.browserEvent = e;
        this.leftButton = e.button === 0;
        this.middleButton = e.button === 1;
        this.rightButton = e.button === 2;
        this.target = e.target;
        this.detail = e.detail || 1;
        if (e.type === 'dblclick') {
            this.detail = 2;
        }
        this.ctrlKey = e.ctrlKey;
        this.shiftKey = e.shiftKey;
        this.altKey = e.altKey;
        this.metaKey = e.metaKey;
        if (typeof e.pageX === 'number') {
            this.posx = e.pageX;
            this.posy = e.pageY;
        }
        else {
            // Probably hit by MSGestureEvent
            this.posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            this.posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        // Find the position of the iframe this code is executing in relative to the iframe where the event was captured.
        let iframeOffsets = iframe_1.IframeUtils.getPositionOfChildWindowRelativeToAncestorWindow(self, e.view);
        this.posx -= iframeOffsets.left;
        this.posy -= iframeOffsets.top;
    }
    preventDefault() {
        if (this.browserEvent.preventDefault) {
            this.browserEvent.preventDefault();
        }
    }
    stopPropagation() {
        if (this.browserEvent.stopPropagation) {
            this.browserEvent.stopPropagation();
        }
    }
}
exports.StandardMouseEvent = StandardMouseEvent;
class DragMouseEvent extends StandardMouseEvent {
    constructor(e) {
        super(e);
        this.dataTransfer = e.dataTransfer;
    }
}
exports.DragMouseEvent = DragMouseEvent;
class StandardWheelEvent {
    constructor(e, deltaX = 0, deltaY = 0) {
        this.browserEvent = e || null;
        this.target = e ? (e.target || e.targetNode || e.srcElement) : null;
        this.deltaY = deltaY;
        this.deltaX = deltaX;
        if (e) {
            let e1 = e;
            let e2 = e;
            // vertical delta scroll
            if (typeof e1.wheelDeltaY !== 'undefined') {
                this.deltaY = e1.wheelDeltaY / 120;
            }
            else if (typeof e2.VERTICAL_AXIS !== 'undefined' && e2.axis === e2.VERTICAL_AXIS) {
                this.deltaY = -e2.detail / 3;
            }
            // horizontal delta scroll
            if (typeof e1.wheelDeltaX !== 'undefined') {
                if (browser.isSafari && platform.isWindows) {
                    this.deltaX = -(e1.wheelDeltaX / 120);
                }
                else {
                    this.deltaX = e1.wheelDeltaX / 120;
                }
            }
            else if (typeof e2.HORIZONTAL_AXIS !== 'undefined' && e2.axis === e2.HORIZONTAL_AXIS) {
                this.deltaX = -e.detail / 3;
            }
            // Assume a vertical scroll if nothing else worked
            if (this.deltaY === 0 && this.deltaX === 0 && e.wheelDelta) {
                this.deltaY = e.wheelDelta / 120;
            }
        }
    }
    preventDefault() {
        if (this.browserEvent) {
            if (this.browserEvent.preventDefault) {
                this.browserEvent.preventDefault();
            }
        }
    }
    stopPropagation() {
        if (this.browserEvent) {
            if (this.browserEvent.stopPropagation) {
                this.browserEvent.stopPropagation();
            }
        }
    }
}
exports.StandardWheelEvent = StandardWheelEvent;
