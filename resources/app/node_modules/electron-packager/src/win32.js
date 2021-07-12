'use strict'

const debug = require('debug')('electron-packager')
const path = require('path')

const App = require('./platform')
const common = require('./common')

function updateWineMissingException (err) {
  if (err && err.code === 'ENOENT' && ['spawn wine', 'spawn wine64'].includes(err.syscall)) {
    const binary = err.syscall.split(' ')[1]
    err.message = `Could not find "${binary}" on your system.\n\n` +
      'Wine is required to use the appCopyright, appVersion, buildVersion, icon, and \n' +
      'win32metadata parameters for Windows targets.\n\n' +
      `Make sure that the "${binary}" executable is in your PATH.\n\n` +
      'See https://github.com/electron/electron-packager#building-windows-apps-from-non-windows-platforms for details.'
  }

  return err
}

class WindowsApp extends App {
  get originalElectronName () {
    return 'electron.exe'
  }

  get newElectronName () {
    return `${common.sanitizeAppName(this.executableName)}.exe`
  }

  get electronBinaryPath () {
    return path.join(this.stagingPath, this.newElectronName)
  }

  generateRceditOptionsSansIcon () {
    const win32metadata = {
      FileDescription: this.opts.name,
      InternalName: this.opts.name,
      OriginalFilename: this.newElectronName,
      ProductName: this.opts.name,
      ...this.opts.win32metadata
    }

    const rcOpts = { 'version-string': win32metadata }

    if (this.opts.appVersion) {
      rcOpts['product-version'] = rcOpts['file-version'] = this.opts.appVersion
    }

    if (this.opts.buildVersion) {
      rcOpts['file-version'] = this.opts.buildVersion
    }

    if (this.opts.appCopyright) {
      rcOpts['version-string'].LegalCopyright = this.opts.appCopyright
    }

    const manifestProperties = ['application-manifest', 'requested-execution-level']
    for (const manifestProperty of manifestProperties) {
      if (win32metadata[manifestProperty]) {
        rcOpts[manifestProperty] = win32metadata[manifestProperty]
      }
    }

    return rcOpts
  }

  async getIconPath () {
    if (!this.opts.icon) {
      return Promise.resolve()
    }

    return this.normalizeIconExtension('.ico')
  }

  needsRcedit () {
    return this.opts.icon || this.opts.win32metadata || this.opts.appCopyright || this.opts.appVersion || this.opts.buildVersion
  }

  async runRcedit () {
    /* istanbul ignore if */
    if (!this.needsRcedit()) {
      return Promise.resolve()
    }

    const rcOpts = this.generateRceditOptionsSansIcon()

    try {
      const icon = await this.getIconPath()
      if (icon) {
        rcOpts.icon = icon
      }

      debug(`Running rcedit with the options ${JSON.stringify(rcOpts)}`)
      await require('rcedit')(this.electronBinaryPath, rcOpts)
    } catch (err) {
      // Icon might be omitted or only exist in one OS's format, so skip it if normalizeExt reports an error
      /* istanbul ignore next */
      throw updateWineMissingException(err)
    }
  }

  async create () {
    await this.initialize()
    await this.renameElectron()
    await this.copyExtraResources()
    await this.runRcedit()
    return this.move()
  }
}

module.exports = {
  App: WindowsApp,
  updateWineMissingException: updateWineMissingException
}
