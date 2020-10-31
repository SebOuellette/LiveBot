import * as got from 'got';
import { Downloader } from './Downloader';
/**
 * See [`got#options`](https://github.com/sindresorhus/got#options) for possible keys/values.
 */
export declare type GotDownloaderOptions = got.GotOptions<string | null> & {
    /**
     * if defined, triggers every time `got`'s `downloadProgress` event callback is triggered.
     */
    getProgressCallback?: (progress: got.Progress) => Promise<void>;
    /**
     * if `true`, disables the console progress bar (setting the `ELECTRON_GET_NO_PROGRESS`
     * environment variable to a non-empty value also does this).
     */
    quiet?: boolean;
};
export declare class GotDownloader implements Downloader<GotDownloaderOptions> {
    download(url: string, targetFilePath: string, options?: GotDownloaderOptions): Promise<void>;
}
