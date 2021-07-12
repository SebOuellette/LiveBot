'use strict'

const filenamify = require('filenamify')
const metadata = require('../package.json')
const os = require('os')
const path = require('path')

function sanitizeAppName (name) {
  return filenamify(name, { replacement: '-' })
}

function generateFinalBasename (opts) {
  return `${sanitizeAppName(opts.name)}-${opts.platform}-${opts.arch}`
}

function generateFinalPath (opts) {
  return path.join(opts.out || process.cwd(), generateFinalBasename(opts))
}

function info (message, quiet) {
  if (!quiet) {
    console.error(message)
  }
}

function warning (message, quiet) {
  if (!quiet) {
    console.warn(`WARNING: ${message}`)
  }
}

function subOptionWarning (properties, optionName, parameter, value, quiet) {
  if (Object.prototype.hasOwnProperty.call(properties, parameter)) {
    warning(`${optionName}.${parameter} will be inferred from the main options`, quiet)
  }
  properties[parameter] = value
}

function createAsarOpts (opts) {
  let asarOptions
  if (opts.asar === true) {
    asarOptions = {}
  } else if (typeof opts.asar === 'object') {
    asarOptions = opts.asar
  } else if (opts.asar === false || opts.asar === undefined) {
    return false
  } else {
    warning(`asar parameter set to an invalid value (${opts.asar}), ignoring and disabling asar`)
    return false
  }

  return asarOptions
}

module.exports = {
  ensureArray: function ensureArray (value) {
    return Array.isArray(value) ? value : [value]
  },
  isPlatformMac: function isPlatformMac (platform) {
    return platform === 'darwin' || platform === 'mas'
  },

  createAsarOpts: createAsarOpts,

  deprecatedParameter: function deprecatedParameter (properties, oldName, newName, newCLIName) {
    if (Object.prototype.hasOwnProperty.call(properties, oldName)) {
      warning(`The ${oldName} parameter is deprecated, use ${newName} (or --${newCLIName} in the CLI) instead`)
      if (!Object.prototype.hasOwnProperty.call(properties, newName)) {
        properties[newName] = properties[oldName]
      }
      delete properties[oldName]
    }
  },
  subOptionWarning: subOptionWarning,

  baseTempDir: function baseTempDir (opts) {
    return path.join(opts.tmpdir || os.tmpdir(), 'electron-packager')
  },
  generateFinalBasename: generateFinalBasename,
  generateFinalPath: generateFinalPath,
  sanitizeAppName,
  /**
   * Convert slashes to UNIX-format separators.
   */
  normalizePath: function normalizePath (pathToNormalize) {
    return pathToNormalize.replace(/\\/g, '/')
  },

  hostInfo: function hostInfo () {
    return `Electron Packager ${metadata.version}\n` +
      `Node ${process.version}\n` +
      `Host Operating system: ${process.platform} ${os.release()} (${process.arch})`
  },
  info: info,
  warning: warning
}
