"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../common/event");
class WindowManager {
    constructor() {
        // --- Zoom Level
        this._zoomLevel = 0;
        this._lastZoomLevelChangeTime = 0;
        this._onDidChangeZoomLevel = new event_1.Emitter();
        this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
        // --- Zoom Factor
        this._zoomFactor = 0;
        this._onDidChangeFullscreen = new event_1.Emitter();
        this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
        // --- Accessibility
        this._accessibilitySupport = 0 /* Unknown */;
        this._onDidChangeAccessibilitySupport = new event_1.Emitter();
        this.onDidChangeAccessibilitySupport = this._onDidChangeAccessibilitySupport.event;
    }
    getZoomLevel() {
        return this._zoomLevel;
    }
    getTimeSinceLastZoomLevelChanged() {
        return Date.now() - this._lastZoomLevelChangeTime;
    }
    setZoomLevel(zoomLevel, isTrusted) {
        if (this._zoomLevel === zoomLevel) {
            return;
        }
        this._zoomLevel = zoomLevel;
        // See https://github.com/Microsoft/vscode/issues/26151
        this._lastZoomLevelChangeTime = isTrusted ? 0 : Date.now();
        this._onDidChangeZoomLevel.fire(this._zoomLevel);
    }
    getZoomFactor() {
        return this._zoomFactor;
    }
    setZoomFactor(zoomFactor) {
        this._zoomFactor = zoomFactor;
    }
    // --- Pixel Ratio
    getPixelRatio() {
        let ctx = document.createElement('canvas').getContext('2d');
        let dpr = window.devicePixelRatio || 1;
        let bsr = ctx.webkitBackingStorePixelRatio ||
            ctx.mozBackingStorePixelRatio ||
            ctx.msBackingStorePixelRatio ||
            ctx.oBackingStorePixelRatio ||
            ctx.backingStorePixelRatio || 1;
        return dpr / bsr;
    }
    setFullscreen(fullscreen) {
        if (this._fullscreen === fullscreen) {
            return;
        }
        this._fullscreen = fullscreen;
        this._onDidChangeFullscreen.fire();
    }
    isFullscreen() {
        return this._fullscreen;
    }
    setAccessibilitySupport(accessibilitySupport) {
        if (this._accessibilitySupport === accessibilitySupport) {
            return;
        }
        this._accessibilitySupport = accessibilitySupport;
        this._onDidChangeAccessibilitySupport.fire();
    }
    getAccessibilitySupport() {
        return this._accessibilitySupport;
    }
}
WindowManager.INSTANCE = new WindowManager();
/** A zoom index, e.g. 1, 2, 3 */
function setZoomLevel(zoomLevel, isTrusted) {
    WindowManager.INSTANCE.setZoomLevel(zoomLevel, isTrusted);
}
exports.setZoomLevel = setZoomLevel;
function getZoomLevel() {
    return WindowManager.INSTANCE.getZoomLevel();
}
exports.getZoomLevel = getZoomLevel;
/** Returns the time (in ms) since the zoom level was changed */
function getTimeSinceLastZoomLevelChanged() {
    return WindowManager.INSTANCE.getTimeSinceLastZoomLevelChanged();
}
exports.getTimeSinceLastZoomLevelChanged = getTimeSinceLastZoomLevelChanged;
function onDidChangeZoomLevel(callback) {
    return WindowManager.INSTANCE.onDidChangeZoomLevel(callback);
}
exports.onDidChangeZoomLevel = onDidChangeZoomLevel;
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
function getZoomFactor() {
    return WindowManager.INSTANCE.getZoomFactor();
}
exports.getZoomFactor = getZoomFactor;
function setZoomFactor(zoomFactor) {
    WindowManager.INSTANCE.setZoomFactor(zoomFactor);
}
exports.setZoomFactor = setZoomFactor;
function getPixelRatio() {
    return WindowManager.INSTANCE.getPixelRatio();
}
exports.getPixelRatio = getPixelRatio;
function setFullscreen(fullscreen) {
    WindowManager.INSTANCE.setFullscreen(fullscreen);
}
exports.setFullscreen = setFullscreen;
function isFullscreen() {
    return WindowManager.INSTANCE.isFullscreen();
}
exports.isFullscreen = isFullscreen;
exports.onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;
function setAccessibilitySupport(accessibilitySupport) {
    WindowManager.INSTANCE.setAccessibilitySupport(accessibilitySupport);
}
exports.setAccessibilitySupport = setAccessibilitySupport;
function getAccessibilitySupport() {
    return WindowManager.INSTANCE.getAccessibilitySupport();
}
exports.getAccessibilitySupport = getAccessibilitySupport;
function onDidChangeAccessibilitySupport(callback) {
    return WindowManager.INSTANCE.onDidChangeAccessibilitySupport(callback);
}
exports.onDidChangeAccessibilitySupport = onDidChangeAccessibilitySupport;
const userAgent = navigator.userAgent;
exports.isIE = (userAgent.indexOf('Trident') >= 0);
exports.isEdge = (userAgent.indexOf('Edge/') >= 0);
exports.isEdgeOrIE = exports.isIE || exports.isEdge;
exports.isOpera = (userAgent.indexOf('Opera') >= 0);
exports.isFirefox = (userAgent.indexOf('Firefox') >= 0);
exports.isWebKit = (userAgent.indexOf('AppleWebKit') >= 0);
exports.isChrome = (userAgent.indexOf('Chrome') >= 0);
exports.isSafari = (!exports.isChrome && (userAgent.indexOf('Safari') >= 0));
exports.isWebkitWebView = (!exports.isChrome && !exports.isSafari && exports.isWebKit);
exports.isIPad = (userAgent.indexOf('iPad') >= 0);
exports.isEdgeWebView = exports.isEdge && (userAgent.indexOf('WebView/') >= 0);
function hasClipboardSupport() {
    if (exports.isIE) {
        return false;
    }
    if (exports.isEdge) {
        let index = userAgent.indexOf('Edge/');
        let version = parseInt(userAgent.substring(index + 5, userAgent.indexOf('.', index)), 10);
        if (!version || (version >= 12 && version <= 16)) {
            return false;
        }
    }
    return true;
}
exports.hasClipboardSupport = hasClipboardSupport;
