import { IDisposable, Disposable } from '../common/lifecycle';
import { Event, Emitter } from '../common/event';
export interface ITelemetryData {
    from?: string;
    target?: string;
    [key: string]: any;
}
export interface IAction extends IDisposable {
    id: string;
    label: string;
    tooltip: string;
    class: string | undefined;
    enabled: boolean;
    checked: boolean;
    radio: boolean;
    run(event?: any): Promise<any>;
}
export interface IActionRunner extends IDisposable {
    run(action: IAction, context?: any): Promise<any>;
    onDidRun: Event<IRunEvent>;
    onDidBeforeRun: Event<IRunEvent>;
}
export interface IActionViewItem extends IDisposable {
    actionRunner: IActionRunner;
    setActionContext(context: any): void;
    render(element: any): void;
    isEnabled(): boolean;
    focus(): void;
    blur(): void;
}
export interface IActionChangeEvent {
    label?: string;
    tooltip?: string;
    class?: string;
    enabled?: boolean;
    checked?: boolean;
    radio?: boolean;
}
export declare class Action extends Disposable implements IAction {
    protected _onDidChange: Emitter<IActionChangeEvent>;
    readonly onDidChange: Event<IActionChangeEvent>;
    protected _id: string;
    protected _label: string;
    protected _tooltip: string;
    protected _cssClass: string | undefined;
    protected _enabled: boolean;
    protected _checked: boolean;
    protected _radio: boolean;
    protected _actionCallback?: (event?: any) => Promise<any>;
    constructor(id: string, label?: string, cssClass?: string, enabled?: boolean, actionCallback?: (event?: any) => Promise<any>);
    readonly id: string;
    label: string;
    protected _setLabel(value: string): void;
    tooltip: string;
    protected _setTooltip(value: string): void;
    class: string | undefined;
    protected _setClass(value: string | undefined): void;
    enabled: boolean;
    protected _setEnabled(value: boolean): void;
    checked: boolean;
    radio: boolean;
    protected _setChecked(value: boolean): void;
    protected _setRadio(value: boolean): void;
    run(event?: any, _data?: ITelemetryData): Promise<any>;
}
export interface IRunEvent {
    action: IAction;
    result?: any;
    error?: any;
}
export declare class ActionRunner extends Disposable implements IActionRunner {
    private _onDidBeforeRun;
    readonly onDidBeforeRun: Event<IRunEvent>;
    private _onDidRun;
    readonly onDidRun: Event<IRunEvent>;
    run(action: IAction, context?: any): Promise<any>;
    protected runAction(action: IAction, context?: any): Promise<any>;
}
export declare class RadioGroup extends Disposable {
    readonly actions: Action[];
    constructor(actions: Action[]);
}
