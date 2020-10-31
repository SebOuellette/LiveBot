"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = require("debug");
const path = require("path");
const sumchecker = require("sumchecker");
const artifact_utils_1 = require("./artifact-utils");
const Cache_1 = require("./Cache");
const downloader_resolver_1 = require("./downloader-resolver");
const proxy_1 = require("./proxy");
const utils_1 = require("./utils");
var utils_2 = require("./utils");
exports.getHostArch = utils_2.getHostArch;
var proxy_2 = require("./proxy");
exports.initializeProxy = proxy_2.initializeProxy;
const d = debug_1.default('@electron/get:index');
if (process.env.ELECTRON_GET_USE_PROXY) {
    proxy_1.initializeProxy();
}
/**
 * Downloads a specific version of Electron and returns an absolute path to a
 * ZIP file.
 *
 * @param version - The version of Electron you want to download
 */
function download(version, options) {
    return downloadArtifact(Object.assign(Object.assign({}, options), { version, platform: process.platform, arch: process.arch, artifactName: 'electron' }));
}
exports.download = download;
/**
 * Downloads an artifact from an Electron release and returns an absolute path
 * to the downloaded file.
 *
 * @param artifactDetails - The information required to download the artifact
 */
async function downloadArtifact(_artifactDetails) {
    const artifactDetails = Object.assign({}, _artifactDetails);
    if (!_artifactDetails.isGeneric) {
        const platformArtifactDetails = artifactDetails;
        if (!platformArtifactDetails.platform) {
            d('No platform found, defaulting to the host platform');
            platformArtifactDetails.platform = process.platform;
        }
        if (platformArtifactDetails.arch) {
            platformArtifactDetails.arch = utils_1.getNodeArch(platformArtifactDetails.arch);
        }
        else {
            d('No arch found, defaulting to the host arch');
            platformArtifactDetails.arch = utils_1.getHostArch();
        }
    }
    utils_1.ensureIsTruthyString(artifactDetails, 'version');
    artifactDetails.version = utils_1.normalizeVersion(process.env.ELECTRON_CUSTOM_VERSION || artifactDetails.version);
    const fileName = artifact_utils_1.getArtifactFileName(artifactDetails);
    const url = await artifact_utils_1.getArtifactRemoteURL(artifactDetails);
    const cache = new Cache_1.Cache(artifactDetails.cacheRoot);
    // Do not check if the file exists in the cache when force === true
    if (!artifactDetails.force) {
        d(`Checking the cache (${artifactDetails.cacheRoot}) for ${fileName} (${url})`);
        const cachedPath = await cache.getPathForFileInCache(url, fileName);
        if (cachedPath === null) {
            d('Cache miss');
        }
        else {
            d('Cache hit');
            return cachedPath;
        }
    }
    if (!artifactDetails.isGeneric &&
        utils_1.isOfficialLinuxIA32Download(artifactDetails.platform, artifactDetails.arch, artifactDetails.version, artifactDetails.mirrorOptions)) {
        console.warn('Official Linux/ia32 support is deprecated.');
        console.warn('For more info: https://electronjs.org/blog/linux-32bit-support');
    }
    return await utils_1.withTempDirectoryIn(artifactDetails.tempDirectory, async (tempFolder) => {
        const tempDownloadPath = path.resolve(tempFolder, artifact_utils_1.getArtifactFileName(artifactDetails));
        const downloader = artifactDetails.downloader || (await downloader_resolver_1.getDownloaderForSystem());
        d(`Downloading ${url} to ${tempDownloadPath} with options: ${JSON.stringify(artifactDetails.downloadOptions)}`);
        await downloader.download(url, tempDownloadPath, artifactDetails.downloadOptions);
        // Don't try to verify the hash of the hash file itself
        if (!artifactDetails.artifactName.startsWith('SHASUMS256') &&
            !artifactDetails.unsafelyDisableChecksums) {
            const shasumPath = await downloadArtifact({
                isGeneric: true,
                version: artifactDetails.version,
                artifactName: 'SHASUMS256.txt',
                force: artifactDetails.force,
                downloadOptions: artifactDetails.downloadOptions,
                cacheRoot: artifactDetails.cacheRoot,
                downloader: artifactDetails.downloader,
                mirrorOptions: artifactDetails.mirrorOptions,
            });
            await sumchecker('sha256', shasumPath, path.dirname(tempDownloadPath), [
                path.basename(tempDownloadPath),
            ]);
        }
        return await cache.putFileInCache(url, tempDownloadPath, fileName);
    });
}
exports.downloadArtifact = downloadArtifact;
//# sourceMappingURL=index.js.map