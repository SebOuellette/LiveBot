"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;
let _isNative = false;
let _isWeb = false;
let _locale = undefined;
let _language = undefined;
let _translationsConfigFile = undefined;
exports.LANGUAGE_DEFAULT = 'en';
const isElectronRenderer = (typeof process !== 'undefined' && typeof process.versions !== 'undefined' && typeof process.versions.electron !== 'undefined' && process.type === 'renderer');
// OS detection
if (typeof navigator === 'object' && !isElectronRenderer) {
    const userAgent = navigator.userAgent;
    _isWindows = userAgent.indexOf('Windows') >= 0;
    _isMacintosh = userAgent.indexOf('Macintosh') >= 0;
    _isLinux = userAgent.indexOf('Linux') >= 0;
    _isWeb = true;
    _locale = navigator.language;
    _language = _locale;
}
else if (typeof process === 'object') {
    _isWindows = (process.platform === 'win32');
    _isMacintosh = (process.platform === 'darwin');
    _isLinux = (process.platform === 'linux');
    _locale = exports.LANGUAGE_DEFAULT;
    _language = exports.LANGUAGE_DEFAULT;
    const rawNlsConfig = process.env['VSCODE_NLS_CONFIG'];
    if (rawNlsConfig) {
        try {
            const nlsConfig = JSON.parse(rawNlsConfig);
            const resolved = nlsConfig.availableLanguages['*'];
            _locale = nlsConfig.locale;
            // VSCode's default language is 'en'
            _language = resolved ? resolved : exports.LANGUAGE_DEFAULT;
            _translationsConfigFile = nlsConfig._translationsConfigFile;
        }
        catch (e) {
        }
    }
    _isNative = true;
}
function PlatformToString(platform) {
    switch (platform) {
        case 0 /* Web */: return 'Web';
        case 1 /* Mac */: return 'Mac';
        case 2 /* Linux */: return 'Linux';
        case 3 /* Windows */: return 'Windows';
    }
}
exports.PlatformToString = PlatformToString;
let _platform = 0 /* Web */;
if (_isNative) {
    if (_isMacintosh) {
        _platform = 1 /* Mac */;
    }
    else if (_isWindows) {
        _platform = 3 /* Windows */;
    }
    else if (_isLinux) {
        _platform = 2 /* Linux */;
    }
}
exports.isWindows = _isWindows;
exports.isMacintosh = _isMacintosh;
exports.isLinux = _isLinux;
exports.isNative = _isNative;
exports.isWeb = _isWeb;
exports.platform = _platform;
function isRootUser() {
    return _isNative && !_isWindows && (process.getuid() === 0);
}
exports.isRootUser = isRootUser;
/**
 * The language used for the user interface. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese)
 */
exports.language = _language;
/**
 * The OS locale or the locale specified by --locale. The format of
 * the string is all lower case (e.g. zh-tw for Traditional
 * Chinese). The UI is not necessarily shown in the provided locale.
 */
exports.locale = _locale;
/**
 * The translatios that are available through language packs.
 */
exports.translationsConfigFile = _translationsConfigFile;
const _globals = (typeof self === 'object' ? self : typeof global === 'object' ? global : {});
exports.globals = _globals;
let _setImmediate = null;
function setImmediate(callback) {
    if (_setImmediate === null) {
        if (exports.globals.setImmediate) {
            _setImmediate = exports.globals.setImmediate.bind(exports.globals);
        }
        else if (typeof process !== 'undefined' && typeof process.nextTick === 'function') {
            _setImmediate = process.nextTick.bind(process);
        }
        else {
            _setImmediate = exports.globals.setTimeout.bind(exports.globals);
        }
    }
    return _setImmediate(callback);
}
exports.setImmediate = setImmediate;
exports.OS = (_isMacintosh ? 2 /* Macintosh */ : (_isWindows ? 1 /* Windows */ : 3 /* Linux */));
