export declare const enum KeyboardSupport {
    Always = 0,
    FullScreen = 1,
    None = 2
}
/**
 * Browser feature we can support in current platform, browser and environment.
 */
export declare const BrowserFeatures: {
    clipboard: {
        writeText: boolean;
        readText: boolean;
        richText: boolean;
    };
    keyboard: KeyboardSupport;
    touch: boolean;
    pointerEvents: boolean;
};
