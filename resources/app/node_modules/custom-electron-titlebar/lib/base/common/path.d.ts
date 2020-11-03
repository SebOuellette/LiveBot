export interface ParsedPath {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
}
export interface IPath {
    normalize(path: string): string;
    isAbsolute(path: string): boolean;
    join(...paths: string[]): string;
    resolve(...pathSegments: string[]): string;
    relative(from: string, to: string): string;
    dirname(path: string): string;
    basename(path: string, ext?: string): string;
    extname(path: string): string;
    format(pathObject: ParsedPath): string;
    parse(path: string): ParsedPath;
    toNamespacedPath(path: string): string;
    sep: '\\' | '/';
    delimiter: string;
    win32: IPath | null;
    posix: IPath | null;
}
export declare const win32: IPath;
export declare const posix: IPath;
export declare const normalize: (path: string) => string;
export declare const isAbsolute: (path: string) => boolean;
export declare const join: (...paths: string[]) => string;
export declare const resolve: (...pathSegments: string[]) => string;
export declare const relative: (from: string, to: string) => string;
export declare const dirname: (path: string) => string;
export declare const basename: (path: string, ext?: string) => string;
export declare const extname: (path: string) => string;
export declare const format: (pathObject: ParsedPath) => string;
export declare const parse: (path: string) => ParsedPath;
export declare const toNamespacedPath: (path: string) => string;
export declare const sep: "/" | "\\";
export declare const delimiter: string;
