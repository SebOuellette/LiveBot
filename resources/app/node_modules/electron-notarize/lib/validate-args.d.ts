import { NotarizeApiKeyCredentials, NotarizeCredentials, NotarizePasswordCredentials } from './index';
export declare function isPasswordCredentials(opts: NotarizeCredentials): opts is NotarizePasswordCredentials;
export declare function isApiKeyCredentials(opts: NotarizeCredentials): opts is NotarizeApiKeyCredentials;
export declare function validateAuthorizationArgs(opts: NotarizeCredentials): NotarizeCredentials;
