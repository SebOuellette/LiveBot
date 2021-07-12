'use strict'

const common = require('./common')
const copyFilter = require('./copy-filter')
const debug = require('debug')('electron-packager')
const download = require('./download')
const fs = require('fs-extra')
const getMetadataFromPackageJSON = require('./infer')
const hooks = require('./hooks')
const path = require('path')
const targets = require('./targets')
const unzip = require('./unzip')

function debugHostInfo () {
  debug(common.hostInfo())
}

class Packager {
  constructor (opts) {
    this.opts = opts
    this.tempBase = common.baseTempDir(opts)
    this.useTempDir = opts.tmpdir !== false
    this.canCreateSymlinks = undefined
  }

  async ensureTempDir () {
    if (this.useTempDir) {
      await fs.remove(this.tempBase)
    } else {
      return Promise.resolve()
    }
  }

  async testSymlink (comboOpts, zipPath) {
    const testPath = path.join(this.tempBase, `symlink-test-${comboOpts.platform}-${comboOpts.arch}`)
    const testFile = path.join(testPath, 'test')
    const testLink = path.join(testPath, 'testlink')

    try {
      await fs.outputFile(testFile, '')
      await fs.symlink(testFile, testLink)
      this.canCreateSymlinks = true
    } catch (e) {
      /* istanbul ignore next */
      this.canCreateSymlinks = false
    } finally {
      await fs.remove(testPath)
    }

    if (this.canCreateSymlinks) {
      return this.checkOverwrite(comboOpts, zipPath)
    }

    /* istanbul ignore next */
    return this.skipHostPlatformSansSymlinkSupport(comboOpts)
  }

  /* istanbul ignore next */
  skipHostPlatformSansSymlinkSupport (comboOpts) {
    common.info(`Cannot create symlinks (on Windows hosts, it requires admin privileges); skipping ${comboOpts.platform} platform`, this.opts.quiet)
    return Promise.resolve()
  }

  async overwriteAndCreateApp (outDir, comboOpts, zipPath) {
    debug(`Removing ${outDir} due to setting overwrite: true`)
    await fs.remove(outDir)
    return this.createApp(comboOpts, zipPath)
  }

  async extractElectronZip (comboOpts, zipPath, buildDir) {
    debug(`Extracting ${zipPath} to ${buildDir}`)
    await unzip(zipPath, buildDir)
    await hooks.promisifyHooks(this.opts.afterExtract, [buildDir, comboOpts.electronVersion, comboOpts.platform, comboOpts.arch])
  }

  async createApp (comboOpts, zipPath) {
    let buildParentDir
    if (this.useTempDir) {
      buildParentDir = this.tempBase
    } else {
      buildParentDir = this.opts.out || process.cwd()
    }
    const buildDir = path.resolve(buildParentDir, `${comboOpts.platform}-${comboOpts.arch}-template`)
    common.info(`Packaging app for platform ${comboOpts.platform} ${comboOpts.arch} using electron v${comboOpts.electronVersion}`, this.opts.quiet)

    debug(`Creating ${buildDir}`)
    await fs.ensureDir(buildDir)
    await this.extractElectronZip(comboOpts, zipPath, buildDir)
    const os = require(targets.osModules[comboOpts.platform])
    const app = new os.App(comboOpts, buildDir)
    return app.create()
  }

  async checkOverwrite (comboOpts, zipPath) {
    const finalPath = common.generateFinalPath(comboOpts)
    if (await fs.pathExists(finalPath)) {
      if (this.opts.overwrite) {
        return this.overwriteAndCreateApp(finalPath, comboOpts, zipPath)
      } else {
        common.info(`Skipping ${comboOpts.platform} ${comboOpts.arch} (output dir already exists, use --overwrite to force)`, this.opts.quiet)
        return true
      }
    } else {
      return this.createApp(comboOpts, zipPath)
    }
  }

  async getElectronZipPath (downloadOpts) {
    if (this.opts.electronZipDir) {
      if (await fs.pathExists(this.opts.electronZipDir)) {
        const zipPath = path.resolve(
          this.opts.electronZipDir,
          `electron-v${downloadOpts.version}-${downloadOpts.platform}-${downloadOpts.arch}.zip`
        )
        if (!await fs.pathExists(zipPath)) {
          throw new Error(`The specified Electron ZIP file does not exist: ${zipPath}`)
        }

        return zipPath
      }

      throw new Error(`The specified Electron ZIP directory does not exist: ${this.opts.electronZipDir}`)
    } else {
      return download.downloadElectronZip(downloadOpts)
    }
  }

  async packageForPlatformAndArch (downloadOpts) {
    const zipPath = await this.getElectronZipPath(downloadOpts)
    // Create delegated options object with specific platform and arch, for output directory naming
    const comboOpts = {
      ...this.opts,
      arch: downloadOpts.arch,
      platform: downloadOpts.platform,
      electronVersion: downloadOpts.version
    }

    if (!this.useTempDir) {
      return this.createApp(comboOpts, zipPath)
    }

    if (common.isPlatformMac(comboOpts.platform)) {
      /* istanbul ignore else */
      if (this.canCreateSymlinks === undefined) {
        return this.testSymlink(comboOpts, zipPath)
      } else if (!this.canCreateSymlinks) {
        return this.skipHostPlatformSansSymlinkSupport(comboOpts)
      }
    }

    return this.checkOverwrite(comboOpts, zipPath)
  }
}

async function packageAllSpecifiedCombos (opts, archs, platforms) {
  const packager = new Packager(opts)
  await packager.ensureTempDir()
  return Promise.all(download.createDownloadCombos(opts, platforms, archs).map(
    downloadOpts => packager.packageForPlatformAndArch(downloadOpts)
  ))
}

module.exports = async function packager (opts) {
  debugHostInfo()
  if (debug.enabled) debug(`Packager Options: ${JSON.stringify(opts)}`)

  const archs = targets.validateListFromOptions(opts, 'arch')
  const platforms = targets.validateListFromOptions(opts, 'platform')
  if (!Array.isArray(archs)) return Promise.reject(archs)
  if (!Array.isArray(platforms)) return Promise.reject(platforms)

  debug(`Target Platforms: ${platforms.join(', ')}`)
  debug(`Target Architectures: ${archs.join(', ')}`)

  const packageJSONDir = path.resolve(process.cwd(), opts.dir) || process.cwd()

  await getMetadataFromPackageJSON(platforms, opts, packageJSONDir)
  if (opts.name.endsWith(' Helper')) {
    throw new Error('Application names cannot end in " Helper" due to limitations on macOS')
  }

  debug(`Application name: ${opts.name}`)
  debug(`Target Electron version: ${opts.electronVersion}`)

  copyFilter.populateIgnoredPaths(opts)

  const appPaths = await packageAllSpecifiedCombos(opts, archs, platforms)
  // Remove falsy entries (e.g. skipped platforms)
  return appPaths.filter(appPath => appPath)
}
