'use strict'

const App = require('./platform')
const common = require('./common')
const debug = require('debug')('electron-packager')
const fs = require('fs-extra')
const path = require('path')
const plist = require('plist')
const { notarize, validateAuthorizationArgs } = require('electron-notarize')
const { signAsync } = require('electron-osx-sign')

class MacApp extends App {
  constructor (opts, templatePath) {
    super(opts, templatePath)

    this.appName = opts.name
  }

  get appCategoryType () {
    return this.opts.appCategoryType
  }

  get appCopyright () {
    return this.opts.appCopyright
  }

  get appVersion () {
    return this.opts.appVersion
  }

  get buildVersion () {
    return this.opts.buildVersion
  }

  get enableDarkMode () {
    return this.opts.darwinDarkModeSupport
  }

  get usageDescription () {
    return this.opts.usageDescription
  }

  get protocols () {
    return this.opts.protocols.map((protocol) => {
      return {
        CFBundleURLName: protocol.name,
        CFBundleURLSchemes: [].concat(protocol.schemes)
      }
    })
  }

  get dotAppName () {
    return `${common.sanitizeAppName(this.appName)}.app`
  }

  get defaultBundleName () {
    return `com.electron.${common.sanitizeAppName(this.appName).toLowerCase()}`
  }

  get bundleName () {
    return filterCFBundleIdentifier(this.opts.appBundleId || this.defaultBundleName)
  }

  get originalResourcesDir () {
    return path.join(this.contentsPath, 'Resources')
  }

  get resourcesDir () {
    return path.join(this.dotAppName, 'Contents', 'Resources')
  }

  get electronBinaryDir () {
    return path.join(this.contentsPath, 'MacOS')
  }

  get originalElectronName () {
    return 'Electron'
  }

  get newElectronName () {
    return this.appPlist.CFBundleExecutable
  }

  get renamedAppPath () {
    return path.join(this.stagingPath, this.dotAppName)
  }

  get electronAppPath () {
    return path.join(this.stagingPath, `${this.originalElectronName}.app`)
  }

  get contentsPath () {
    return path.join(this.electronAppPath, 'Contents')
  }

  get frameworksPath () {
    return path.join(this.contentsPath, 'Frameworks')
  }

  get loginItemsPath () {
    return path.join(this.contentsPath, 'Library', 'LoginItems')
  }

  get loginHelperPath () {
    return path.join(this.loginItemsPath, 'Electron Login Helper.app')
  }

  updatePlist (base, displayName, identifier, name) {
    return Object.assign(base, {
      CFBundleDisplayName: displayName,
      CFBundleExecutable: common.sanitizeAppName(displayName),
      CFBundleIdentifier: identifier,
      CFBundleName: common.sanitizeAppName(name)
    })
  }

  updateHelperPlist (base, suffix, identifierIgnoresSuffix) {
    let helperSuffix, identifier, name
    if (suffix) {
      helperSuffix = `Helper ${suffix}`
      if (identifierIgnoresSuffix) {
        identifier = this.helperBundleIdentifier
      } else {
        identifier = `${this.helperBundleIdentifier}.${suffix}`
      }
      name = `${this.appName} ${helperSuffix}`
    } else {
      helperSuffix = 'Helper'
      identifier = this.helperBundleIdentifier
      name = this.appName
    }
    return this.updatePlist(base, `${this.appName} ${helperSuffix}`, identifier, name)
  }

  async extendAppPlist (propsOrFilename) {
    if (!propsOrFilename) {
      return Promise.resolve()
    }

    if (typeof propsOrFilename === 'string') {
      const plist = await this.loadPlist(propsOrFilename)
      return Object.assign(this.appPlist, plist)
    } else {
      return Object.assign(this.appPlist, propsOrFilename)
    }
  }

  async loadPlist (filename, propName) {
    const loadedPlist = plist.parse((await fs.readFile(filename)).toString())
    if (propName) {
      this[propName] = loadedPlist
    }
    return loadedPlist
  }

  ehPlistFilename (helper) {
    return this.helperPlistFilename(path.join(this.frameworksPath, helper))
  }

  helperPlistFilename (helperApp) {
    return path.join(helperApp, 'Contents', 'Info.plist')
  }

  async determinePlistFilesToUpdate () {
    const appPlistFilename = path.join(this.contentsPath, 'Info.plist')

    const plists = [
      [appPlistFilename, 'appPlist'],
      [this.ehPlistFilename('Electron Helper.app'), 'helperPlist']
    ]

    const possiblePlists = [
      [this.ehPlistFilename('Electron Helper (Renderer).app'), 'helperRendererPlist'],
      [this.ehPlistFilename('Electron Helper (Plugin).app'), 'helperPluginPlist'],
      [this.ehPlistFilename('Electron Helper (GPU).app'), 'helperGPUPlist'],
      [this.ehPlistFilename('Electron Helper EH.app'), 'helperEHPlist'],
      [this.ehPlistFilename('Electron Helper NP.app'), 'helperNPPlist'],
      [this.helperPlistFilename(this.loginHelperPath), 'loginHelperPlist']
    ]

    const optional = await Promise.all(possiblePlists.map(async item =>
      (await fs.pathExists(item[0])) ? item : null))
    return plists.concat(optional.filter(item => item))
  }

  async updatePlistFiles () {
    const appBundleIdentifier = this.bundleName
    this.helperBundleIdentifier = filterCFBundleIdentifier(this.opts.helperBundleId || `${appBundleIdentifier}.helper`)

    const plists = await this.determinePlistFilesToUpdate()
    await Promise.all(plists.map(plistArgs => this.loadPlist(...plistArgs)))
    await this.extendAppPlist(this.opts.extendInfo)
    this.appPlist = this.updatePlist(this.appPlist, this.executableName, appBundleIdentifier, this.appName)
    this.helperPlist = this.updateHelperPlist(this.helperPlist)
    const updateIfExists = [
      ['helperRendererPlist', '(Renderer)', true],
      ['helperPluginPlist', '(Plugin)', true],
      ['helperGPUPlist', '(GPU)', true],
      ['helperEHPlist', 'EH'],
      ['helperNPPlist', 'NP']
    ]
    for (const [plistKey, ...suffixArgs] of updateIfExists) {
      if (!this[plistKey]) continue
      this[plistKey] = this.updateHelperPlist(this[plistKey], ...suffixArgs)
    }

    if (this.loginHelperPlist) {
      const loginHelperName = common.sanitizeAppName(`${this.appName} Login Helper`)
      this.loginHelperPlist.CFBundleExecutable = loginHelperName
      this.loginHelperPlist.CFBundleIdentifier = `${appBundleIdentifier}.loginhelper`
      this.loginHelperPlist.CFBundleName = loginHelperName
    }

    if (this.appVersion) {
      this.appPlist.CFBundleShortVersionString = this.appPlist.CFBundleVersion = '' + this.appVersion
    }

    if (this.buildVersion) {
      this.appPlist.CFBundleVersion = '' + this.buildVersion
    }

    if (this.opts.protocols && this.opts.protocols.length) {
      this.appPlist.CFBundleURLTypes = this.protocols
    }

    if (this.appCategoryType) {
      this.appPlist.LSApplicationCategoryType = this.appCategoryType
    }

    if (this.appCopyright) {
      this.appPlist.NSHumanReadableCopyright = this.appCopyright
    }

    if (this.enableDarkMode) {
      this.appPlist.NSRequiresAquaSystemAppearance = false
    }

    if (this.usageDescription) {
      for (const [type, description] of Object.entries(this.usageDescription)) {
        this.appPlist[`NS${type}UsageDescription`] = description
      }
    }

    await Promise.all(plists.map(([filename, varName]) =>
      fs.writeFile(filename, plist.build(this[varName]))))
  }

  async moveHelpers () {
    const helpers = [' Helper', ' Helper EH', ' Helper NP', ' Helper (Renderer)', ' Helper (Plugin)', ' Helper (GPU)']
    await Promise.all(helpers.map(suffix => this.moveHelper(this.frameworksPath, suffix)))
    if (await fs.pathExists(this.loginItemsPath)) {
      await this.moveHelper(this.loginItemsPath, ' Login Helper')
    }
  }

  async moveHelper (helperDirectory, suffix) {
    const originalBasename = `Electron${suffix}`

    if (await fs.pathExists(path.join(helperDirectory, `${originalBasename}.app`))) {
      return this.renameHelperAndExecutable(
        helperDirectory,
        originalBasename,
        `${common.sanitizeAppName(this.appName)}${suffix}`
      )
    } else {
      return Promise.resolve()
    }
  }

  async renameHelperAndExecutable (helperDirectory, originalBasename, newBasename) {
    const originalAppname = `${originalBasename}.app`
    const executableBasePath = path.join(helperDirectory, originalAppname, 'Contents', 'MacOS')
    await this.relativeRename(executableBasePath, originalBasename, newBasename)
    await this.relativeRename(helperDirectory, originalAppname, `${newBasename}.app`)
  }

  async copyIcon () {
    if (!this.opts.icon) {
      return Promise.resolve()
    }

    let icon

    try {
      icon = await this.normalizeIconExtension('.icns')
    } catch {
      // Ignore error if icon doesn't exist, in case it's only available for other OSes
      /* istanbul ignore next */
      return Promise.resolve()
    }
    if (icon) {
      debug(`Copying icon "${icon}" to app's Resources as "${this.appPlist.CFBundleIconFile}"`)
      await fs.copy(icon, path.join(this.originalResourcesDir, this.appPlist.CFBundleIconFile))
    }
  }

  async renameAppAndHelpers () {
    await this.moveHelpers()
    await fs.rename(this.electronAppPath, this.renamedAppPath)
  }

  async signAppIfSpecified () {
    const osxSignOpt = this.opts.osxSign
    const platform = this.opts.platform
    const version = this.opts.electronVersion

    if ((platform === 'all' || platform === 'mas') &&
        osxSignOpt === undefined) {
      common.warning('signing is required for mas builds. Provide the osx-sign option, ' +
                     'or manually sign the app later.')
    }

    if (osxSignOpt) {
      const signOpts = createSignOpts(osxSignOpt, platform, this.renamedAppPath, version, this.opts.osxNotarize, this.opts.quiet)
      debug(`Running electron-osx-sign with the options ${JSON.stringify(signOpts)}`)
      try {
        await signAsync(signOpts)
      } catch (err) {
        // Although not signed successfully, the application is packed.
        common.warning(`Code sign failed; please retry manually. ${err}`)
      }
    }
  }

  async notarizeAppIfSpecified () {
    const osxNotarizeOpt = this.opts.osxNotarize

    /* istanbul ignore if */
    if (osxNotarizeOpt) {
      const notarizeOpts = createNotarizeOpts(
        osxNotarizeOpt,
        this.bundleName,
        this.renamedAppPath,
        this.opts.quiet
      )
      if (notarizeOpts) {
        return notarize(notarizeOpts)
      }
    }
  }

  async create () {
    await this.initialize()
    await this.updatePlistFiles()
    await this.copyIcon()
    await this.renameElectron()
    await this.renameAppAndHelpers()
    await this.copyExtraResources()
    await this.signAppIfSpecified()
    await this.notarizeAppIfSpecified()
    return this.move()
  }
}

/**
 * Remove special characters and allow only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.)
 * Apple documentation:
 * https://developer.apple.com/library/mac/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102070
 */
function filterCFBundleIdentifier (identifier) {
  return identifier.replace(/ /g, '-').replace(/[^a-zA-Z0-9.-]/g, '')
}

function createSignOpts (properties, platform, app, version, notarize, quiet) {
  // use default sign opts if osx-sign is true, otherwise clone osx-sign object
  const signOpts = properties === true ? { identity: null } : { ...properties }

  // osx-sign options are handed off to sign module, but
  // with a few additions from the main options
  // user may think they can pass platform, app, or version, but they will be ignored
  common.subOptionWarning(signOpts, 'osx-sign', 'platform', platform, quiet)
  common.subOptionWarning(signOpts, 'osx-sign', 'app', app, quiet)
  common.subOptionWarning(signOpts, 'osx-sign', 'version', version, quiet)

  if (signOpts.binaries) {
    common.warning('osx-sign.binaries is not an allowed sub-option. Not passing to electron-osx-sign.')
    delete signOpts.binaries
  }

  // Take argument osx-sign as signing identity:
  // if opts.osxSign is true (bool), fallback to identity=null for
  // autodiscovery. Otherwise, provide signing certificate info.
  if (signOpts.identity === true) {
    signOpts.identity = null
  }

  if (notarize && !signOpts.hardenedRuntime && !signOpts['hardened-runtime']) {
    common.warning('notarization is enabled but hardenedRuntime was not enabled in the signing ' +
      'options. It has been enabled for you but you should enable it in your config.')
    signOpts.hardenedRuntime = true
  }

  return signOpts
}

function createNotarizeOpts (properties, appBundleId, appPath, quiet) {
  try {
    validateAuthorizationArgs(properties)
  } catch (e) {
    common.warning(`Failed validation, notarization will not run: ${e.message}`)
    return
  }

  // osxNotarize options are handed off to the electron-notarize module, but with a few
  // additions from the main options. The user may think they can pass bundle ID or appPath,
  // but they will be ignored.
  common.subOptionWarning(properties, 'osxNotarize', 'appBundleId', appBundleId, quiet)
  common.subOptionWarning(properties, 'osxNotarize', 'appPath', appPath, quiet)
  return properties
}

module.exports = {
  App: MacApp,
  createNotarizeOpts: createNotarizeOpts,
  createSignOpts: createSignOpts,
  filterCFBundleIdentifier: filterCFBundleIdentifier
}
