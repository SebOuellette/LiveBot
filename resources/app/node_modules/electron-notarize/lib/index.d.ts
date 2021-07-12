export { validateAuthorizationArgs } from './validate-args';
export interface NotarizePasswordCredentials {
    appleId: string;
    appleIdPassword: string;
}
export interface NotarizeApiKeyCredentials {
    appleApiKey: string;
    appleApiIssuer: string;
}
export declare type NotarizeCredentials = NotarizePasswordCredentials | NotarizeApiKeyCredentials;
export interface NotarizeAppOptions {
    appPath: string;
    appBundleId: string;
}
export interface TransporterOptions {
    ascProvider?: string;
}
export interface NotarizeResult {
    uuid: string;
}
export declare type NotarizeStartOptions = NotarizeAppOptions & NotarizeCredentials & TransporterOptions;
export declare type NotarizeWaitOptions = NotarizeResult & NotarizeCredentials;
export declare type NotarizeStapleOptions = Pick<NotarizeAppOptions, 'appPath'>;
export declare type NotarizeOptions = NotarizeStartOptions;
export declare function startNotarize(opts: NotarizeStartOptions): Promise<NotarizeResult>;
export declare function waitForNotarize(opts: NotarizeWaitOptions): Promise<void>;
export declare function stapleApp(opts: NotarizeStapleOptions): Promise<void>;
export declare function notarize({ appBundleId, appPath, ascProvider, ...authOptions }: NotarizeOptions): Promise<void>;
