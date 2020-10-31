var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import debug from 'debug';
import envPaths from 'env-paths';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as url from 'url';
import * as sanitize from 'sanitize-filename';
const d = debug('@electron/get:cache');
const defaultCacheRoot = envPaths('electron', {
    suffix: '',
}).cache;
export class Cache {
    constructor(cacheRoot = defaultCacheRoot) {
        this.cacheRoot = cacheRoot;
    }
    getCachePath(downloadUrl, fileName) {
        const _a = url.parse(downloadUrl), { search, hash } = _a, rest = __rest(_a, ["search", "hash"]);
        const strippedUrl = url.format(rest);
        const sanitizedUrl = sanitize(strippedUrl);
        return path.resolve(this.cacheRoot, sanitizedUrl, fileName);
    }
    async getPathForFileInCache(url, fileName) {
        const cachePath = this.getCachePath(url, fileName);
        if (await fs.pathExists(cachePath)) {
            return cachePath;
        }
        return null;
    }
    async putFileInCache(url, currentPath, fileName) {
        const cachePath = this.getCachePath(url, fileName);
        d(`Moving ${currentPath} to ${cachePath}`);
        if (await fs.pathExists(cachePath)) {
            d('* Replacing existing file');
            await fs.remove(cachePath);
        }
        await fs.move(currentPath, cachePath);
        return cachePath;
    }
}
//# sourceMappingURL=Cache.js.map