"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lifecycle_1 = require("../common/lifecycle");
const event_1 = require("../common/event");
class Action extends lifecycle_1.Disposable {
    constructor(id, label = '', cssClass = '', enabled = true, actionCallback) {
        super();
        this._onDidChange = this._register(new event_1.Emitter());
        this.onDidChange = this._onDidChange.event;
        this._id = id;
        this._label = label;
        this._cssClass = cssClass;
        this._enabled = enabled;
        this._actionCallback = actionCallback;
    }
    get id() {
        return this._id;
    }
    get label() {
        return this._label;
    }
    set label(value) {
        this._setLabel(value);
    }
    _setLabel(value) {
        if (this._label !== value) {
            this._label = value;
            this._onDidChange.fire({ label: value });
        }
    }
    get tooltip() {
        return this._tooltip;
    }
    set tooltip(value) {
        this._setTooltip(value);
    }
    _setTooltip(value) {
        if (this._tooltip !== value) {
            this._tooltip = value;
            this._onDidChange.fire({ tooltip: value });
        }
    }
    get class() {
        return this._cssClass;
    }
    set class(value) {
        this._setClass(value);
    }
    _setClass(value) {
        if (this._cssClass !== value) {
            this._cssClass = value;
            this._onDidChange.fire({ class: value });
        }
    }
    get enabled() {
        return this._enabled;
    }
    set enabled(value) {
        this._setEnabled(value);
    }
    _setEnabled(value) {
        if (this._enabled !== value) {
            this._enabled = value;
            this._onDidChange.fire({ enabled: value });
        }
    }
    get checked() {
        return this._checked;
    }
    set checked(value) {
        this._setChecked(value);
    }
    get radio() {
        return this._radio;
    }
    set radio(value) {
        this._setRadio(value);
    }
    _setChecked(value) {
        if (this._checked !== value) {
            this._checked = value;
            this._onDidChange.fire({ checked: value });
        }
    }
    _setRadio(value) {
        if (this._radio !== value) {
            this._radio = value;
            this._onDidChange.fire({ radio: value });
        }
    }
    run(event, _data) {
        if (this._actionCallback) {
            return this._actionCallback(event);
        }
        return Promise.resolve(true);
    }
}
exports.Action = Action;
class ActionRunner extends lifecycle_1.Disposable {
    constructor() {
        super(...arguments);
        this._onDidBeforeRun = this._register(new event_1.Emitter());
        this.onDidBeforeRun = this._onDidBeforeRun.event;
        this._onDidRun = this._register(new event_1.Emitter());
        this.onDidRun = this._onDidRun.event;
    }
    run(action, context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!action.enabled) {
                return Promise.resolve(null);
            }
            this._onDidBeforeRun.fire({ action: action });
            try {
                const result = yield this.runAction(action, context);
                this._onDidRun.fire({ action: action, result: result });
            }
            catch (error) {
                this._onDidRun.fire({ action: action, error: error });
            }
        });
    }
    runAction(action, context) {
        const res = context ? action.run(context) : action.run();
        return Promise.resolve(res);
    }
}
exports.ActionRunner = ActionRunner;
class RadioGroup extends lifecycle_1.Disposable {
    constructor(actions) {
        super();
        this.actions = actions;
        for (const action of actions) {
            this._register(action.onDidChange(e => {
                if (e.checked && action.checked) {
                    for (const candidate of actions) {
                        if (candidate !== action) {
                            candidate.checked = false;
                        }
                    }
                }
            }));
        }
    }
}
exports.RadioGroup = RadioGroup;
