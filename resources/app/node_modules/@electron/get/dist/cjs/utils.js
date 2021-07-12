"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const fs = require("fs-extra");
const os = require("os");
const path = require("path");
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
async function withTempDirectoryIn(parentDirectory = os.tmpdir(), fn) {
    const tempDirectoryPrefix = 'electron-download-';
    const tempDirectory = await fs.mkdtemp(path.resolve(parentDirectory, tempDirectoryPrefix));
    return useAndRemoveDirectory(tempDirectory, fn);
}
exports.withTempDirectoryIn = withTempDirectoryIn;
async function withTempDirectory(fn) {
    return withTempDirectoryIn(undefined, fn);
}
exports.withTempDirectory = withTempDirectory;
function normalizeVersion(version) {
    if (!version.startsWith('v')) {
        return `v${version}`;
    }
    return version;
}
exports.normalizeVersion = normalizeVersion;
/**
 * Runs the `uname` command and returns the trimmed output.
 */
function uname() {
    return childProcess
        .execSync('uname -m')
        .toString()
        .trim();
}
exports.uname = uname;
/**
 * Generates an architecture name that would be used in an Electron or Node.js
 * download file name.
 */
function getNodeArch(arch) {
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
exports.getNodeArch = getNodeArch;
/**
 * Generates an architecture name that would be used in an Electron or Node.js
 * download file name, from the `process` module information.
 */
function getHostArch() {
    return getNodeArch(process.arch);
}
exports.getHostArch = getHostArch;
function ensureIsTruthyString(obj, key) {
    if (!obj[key] || typeof obj[key] !== 'string') {
        throw new Error(`Expected property "${key}" to be provided as a string but it was not`);
    }
}
exports.ensureIsTruthyString = ensureIsTruthyString;
function isOfficialLinuxIA32Download(platform, arch, version, mirrorOptions) {
    return (platform === 'linux' &&
        arch === 'ia32' &&
        Number(version.slice(1).split('.')[0]) >= 4 &&
        typeof mirrorOptions === 'undefined');
}
exports.isOfficialLinuxIA32Download = isOfficialLinuxIA32Download;
//# sourceMappingURL=utils.js.map