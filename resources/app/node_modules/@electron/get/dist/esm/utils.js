import * as childProcess from 'child_process';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
async function useAndRemoveDirectory(directory, fn) {
    let result;
    try {
        result = await fn(directory);
    }
    finally {
        await fs.remove(directory);
    }
    return result;
}
export async function withTempDirectoryIn(parentDirectory = os.tmpdir(), fn) {
    const tempDirectoryPrefix = 'electron-download-';
    const tempDirectory = await fs.mkdtemp(path.resolve(parentDirectory, tempDirectoryPrefix));
    return useAndRemoveDirectory(tempDirectory, fn);
}
export async function withTempDirectory(fn) {
    return withTempDirectoryIn(undefined, fn);
}
export function normalizeVersion(version) {
    if (!version.startsWith('v')) {
        return `v${version}`;
    }
    return version;
}
/**
 * Runs the `uname` command and returns the trimmed output.
 */
export function uname() {
    return childProcess
        .execSync('uname -m')
        .toString()
        .trim();
}
/**
 * Generates an architecture name that would be used in an Electron or Node.js
 * download file name.
 */
export function getNodeArch(arch) {
    if (arch === 'arm') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        switch (process.config.variables.arm_version) {
            case '6':
                return uname();
            case '7':
            default:
                return 'armv7l';
        }
    }
    return arch;
}
/**
 * Generates an architecture name that would be used in an Electron or Node.js
 * download file name, from the `process` module information.
 */
export function getHostArch() {
    return getNodeArch(process.arch);
}
export function ensureIsTruthyString(obj, key) {
    if (!obj[key] || typeof obj[key] !== 'string') {
        throw new Error(`Expected property "${key}" to be provided as a string but it was not`);
    }
}
export function isOfficialLinuxIA32Download(platform, arch, version, mirrorOptions) {
    return (platform === 'linux' &&
        arch === 'ia32' &&
        Number(version.slice(1).split('.')[0]) >= 4 &&
        typeof mirrorOptions === 'undefined');
}
//# sourceMappingURL=utils.js.map