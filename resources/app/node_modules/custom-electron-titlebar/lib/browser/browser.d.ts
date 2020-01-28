import { Event } from '../common/event';
import { IDisposable } from '../common/lifecycle';
import * as platform from '../common/platform';
/** A zoom index, e.g. 1, 2, 3 */
export declare function setZoomLevel(zoomLevel: number, isTrusted: boolean): void;
export declare function getZoomLevel(): number;
/** Returns the time (in ms) since the zoom level was changed */
export declare function getTimeSinceLastZoomLevelChanged(): number;
export declare function onDidChangeZoomLevel(callback: (zoomLevel: number) => void): IDisposable;
/** The zoom scale for an index, e.g. 1, 1.2, 1.4 */
export declare function getZoomFactor(): number;
export declare function setZoomFactor(zoomFactor: number): void;
export declare function getPixelRatio(): number;
export declare function setFullscreen(fullscreen: boolean): void;
export declare function isFullscreen(): boolean;
export declare const onDidChangeFullscreen: Event<void>;
export declare function setAccessibilitySupport(accessibilitySupport: platform.AccessibilitySupport): void;
export declare function getAccessibilitySupport(): platform.AccessibilitySupport;
export declare function onDidChangeAccessibilitySupport(callback: () => void): IDisposable;
export declare const isIE: boolean;
export declare const isEdge: boolean;
export declare const isEdgeOrIE: boolean;
export declare const isOpera: boolean;
export declare const isFirefox: boolean;
export declare const isWebKit: boolean;
export declare const isChrome: boolean;
export declare const isSafari: boolean;
export declare const isWebkitWebView: boolean;
export declare const isIPad: boolean;
export declare const isEdgeWebView: boolean;
export declare function hasClipboardSupport(): boolean;
