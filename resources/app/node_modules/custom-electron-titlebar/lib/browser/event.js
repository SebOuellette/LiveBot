"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../common/event");
exports.domEvent = (element, type, useCapture) => {
    const fn = e => emitter.fire(e);
    const emitter = new event_1.Emitter({
        onFirstListenerAdd: () => {
            element.addEventListener(type, fn, useCapture);
        },
        onLastListenerRemove: () => {
            element.removeEventListener(type, fn, useCapture);
        }
    });
    return emitter.event;
};
function stop(event) {
    return event_1.Event.map(event, e => {
        e.preventDefault();
        e.stopPropagation();
        return e;
    });
}
exports.stop = stop;
