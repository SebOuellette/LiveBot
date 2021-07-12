'use strict'

const common = require('./common')
const { getHostArch } = require('@electron/get')
const semver = require('semver')

const officialArchs = ['ia32', 'x64', 'armv7l', 'arm64', 'mips64el']
const officialPlatforms = ['darwin', 'linux', 'mas', 'win32']
const officialPlatformArchCombos = {
  darwin: ['x64', 'arm64'],
  linux: ['ia32', 'x64', 'armv7l', 'arm64', 'mips64el'],
  mas: ['x64', 'arm64'],
  win32: ['ia32', 'x64', 'arm64']
}

const buildVersions = {
  darwin: {
    arm64: '>= 11.0.0-beta.1'
  },
  linux: {
    arm64: '>= 1.8.0',
    mips64el: '^1.8.2-beta.5'
  },
  mas: {
    arm64: '>= 11.0.0-beta.1'
  },
  win32: {
    arm64: '>= 6.0.8'
  }
}

// Maps to module filename for each platform (lazy-required if used)
const osModules = {
  darwin: './mac',
  linux: './linux',
  mas: './mac', // map to darwin
  win32: './win32'
}

const supported = {
  arch: new Set(officialArchs),
  platform: new Set(officialPlatforms)
}

function createPlatformArchPairs (opts, selectedPlatforms, selectedArchs, ignoreFunc) {
  const combinations = []
  for (const arch of selectedArchs) {
    for (const platform of selectedPlatforms) {
      if (usingOfficialElectronPackages(opts)) {
        if (!validOfficialPlatformArch(opts, platform, arch)) {
          warnIfAllNotSpecified(opts, `The platform/arch combination ${platform}/${arch} is not currently supported by Electron Packager`)
          continue
        } else if (buildVersions[platform] && buildVersions[platform][arch]) {
          const buildVersion = buildVersions[platform][arch]
          if (buildVersion && !officialBuildExists(opts, buildVersion)) {
            warnIfAllNotSpecified(opts, `Official ${platform}/${arch} support only exists in Electron ${buildVersion}`)
            continue
          }
        }
        if (typeof ignoreFunc === 'function' && ignoreFunc(platform, arch)) continue
      }
      combinations.push([platform, arch])
    }
  }

  return combinations
}

function unsupportedListOption (name, value, supported) {
  return new Error(`Unsupported ${name}=${value} (${typeof value}); must be a string matching: ${Array.from(supported.values()).join(', ')}`)
}

function usingOfficialElectronPackages (opts) {
  return !opts.download || !Object.prototype.hasOwnProperty.call(opts.download, 'mirrorOptions')
}

function validOfficialPlatformArch (opts, platform, arch) {
  return officialPlatformArchCombos[platform] && officialPlatformArchCombos[platform].includes(arch)
}

function officialBuildExists (opts, buildVersion) {
  return semver.satisfies(opts.electronVersion, buildVersion, { includePrerelease: true })
}

function allPlatformsOrArchsSpecified (opts) {
  return opts.all || opts.arch === 'all' || opts.platform === 'all'
}

function warnIfAllNotSpecified (opts, message) {
  if (!allPlatformsOrArchsSpecified(opts)) {
    common.warning(message)
  }
}

module.exports = {
  allOfficialArchsForPlatformAndVersion: function allOfficialArchsForPlatformAndVersion (platform, electronVersion) {
    const archs = officialPlatformArchCombos[platform]
    if (buildVersions[platform]) {
      const excludedArchs = Object.keys(buildVersions[platform])
        .filter(arch => !officialBuildExists({ electronVersion: electronVersion }, buildVersions[platform][arch]))
      return archs.filter(arch => !excludedArchs.includes(arch))
    }

    return archs
  },
  createPlatformArchPairs,
  officialArchs,
  officialPlatformArchCombos,
  officialPlatforms,
  osModules,
  supported,
  // Validates list of architectures or platforms.
  // Returns a normalized array if successful, or throws an Error.
  validateListFromOptions: function validateListFromOptions (opts, name) {
    if (opts.all) return Array.from(supported[name].values())

    let list = opts[name]
    if (!list) {
      if (name === 'arch') {
        list = getHostArch()
      } else {
        list = process[name]
      }
    } else if (list === 'all') {
      return Array.from(supported[name].values())
    }

    if (!Array.isArray(list)) {
      if (typeof list === 'string') {
        list = list.split(/,\s*/)
      } else {
        return unsupportedListOption(name, list, supported[name])
      }
    }

    const officialElectronPackages = usingOfficialElectronPackages(opts)

    for (const value of list) {
      if (officialElectronPackages && !supported[name].has(value)) {
        return unsupportedListOption(name, value, supported[name])
      }
    }

    return list
  }
}
