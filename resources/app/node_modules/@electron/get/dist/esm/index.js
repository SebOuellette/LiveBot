import debug from 'debug';
import * as path from 'path';
import * as sumchecker from 'sumchecker';
import { getArtifactFileName, getArtifactRemoteURL } from './artifact-utils';
import { Cache } from './Cache';
import { getDownloaderForSystem } from './downloader-resolver';
import { initializeProxy } from './proxy';
import { withTempDirectoryIn, normalizeVersion, getHostArch, getNodeArch, ensureIsTruthyString, isOfficialLinuxIA32Download, } from './utils';
export { getHostArch } from './utils';
export { initializeProxy } from './proxy';
const d = debug('@electron/get:index');
if (process.env.ELECTRON_GET_USE_PROXY) {
    initializeProxy();
}
/**
 * Downloads a specific version of Electron and returns an absolute path to a
 * ZIP file.
 *
 * @param version - The version of Electron you want to download
 */
export function download(version, options) {
    return downloadArtifact(Object.assign(Object.assign({}, options), { version, platform: process.platform, arch: process.arch, artifactName: 'electron' }));
}
/**
 * Downloads an artifact from an Electron release and returns an absolute path
 * to the downloaded file.
 *
 * @param artifactDetails - The information required to download the artifact
 */
export async function downloadArtifact(_artifactDetails) {
    const artifactDetails = Object.assign({}, _artifactDetails);
    if (!_artifactDetails.isGeneric) {
        const platformArtifactDetails = artifactDetails;
        if (!platformArtifactDetails.platform) {
            d('No platform found, defaulting to the host platform');
            platformArtifactDetails.platform = process.platform;
        }
        if (platformArtifactDetails.arch) {
            platformArtifactDetails.arch = getNodeArch(platformArtifactDetails.arch);
        }
        else {
            d('No arch found, defaulting to the host arch');
            platformArtifactDetails.arch = getHostArch();
        }
    }
    ensureIsTruthyString(artifactDetails, 'version');
    artifactDetails.version = normalizeVersion(process.env.ELECTRON_CUSTOM_VERSION || artifactDetails.version);
    const fileName = getArtifactFileName(artifactDetails);
    const url = await getArtifactRemoteURL(artifactDetails);
    const cache = new Cache(artifactDetails.cacheRoot);
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
        isOfficialLinuxIA32Download(artifactDetails.platform, artifactDetails.arch, artifactDetails.version, artifactDetails.mirrorOptions)) {
        console.warn('Official Linux/ia32 support is deprecated.');
        console.warn('For more info: https://electronjs.org/blog/linux-32bit-support');
    }
    return await withTempDirectoryIn(artifactDetails.tempDirectory, async (tempFolder) => {
        const tempDownloadPath = path.resolve(tempFolder, getArtifactFileName(artifactDetails));
        const downloader = artifactDetails.downloader || (await getDownloaderForSystem());
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
//# sourceMappingURL=index.js.map