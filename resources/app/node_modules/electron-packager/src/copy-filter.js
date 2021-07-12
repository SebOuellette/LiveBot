'use strict'

const common = require('./common')
const debug = require('debug')('electron-packager')
const junk = require('junk')
const path = require('path')
const prune = require('./prune')
const targets = require('./targets')

const DEFAULT_IGNORES = [
  '/package-lock\\.json$',
  '/yarn\\.lock$',
  '/\\.git($|/)',
  '/node_modules/\\.bin($|/)',
  '\\.o(bj)?$'
]

function populateIgnoredPaths (opts) {
  opts.originalIgnore = opts.ignore
  if (typeof (opts.ignore) !== 'function') {
    if (opts.ignore) {
      opts.ignore = common.ensureArray(opts.ignore).concat(DEFAULT_IGNORES)
    } else {
      opts.ignore = [].concat(DEFAULT_IGNORES)
    }
    if (process.platform === 'linux') {
      opts.ignore.push(common.baseTempDir(opts))
    }

    debug('Ignored path regular expressions:', opts.ignore)
  }
}

function generateIgnoredOutDirs (opts) {
  const normalizedOut = opts.out ? path.resolve(opts.out) : null
  const ignoredOutDirs = []
  if (normalizedOut === null || normalizedOut === process.cwd()) {
    for (const [platform, archs] of Object.entries(targets.officialPlatformArchCombos)) {
      for (const arch of archs) {
        const basenameOpts = {
          arch: arch,
          name: opts.name,
          platform: platform
        }
        ignoredOutDirs.push(path.join(process.cwd(), common.generateFinalBasename(basenameOpts)))
      }
    }
  } else {
    ignoredOutDirs.push(normalizedOut)
  }

  debug('Ignored paths based on the out param:', ignoredOutDirs)

  return ignoredOutDirs
}

function generateFilterFunction (ignore) {
  if (typeof (ignore) === 'function') {
    return file => !ignore(file)
  } else {
    const ignoredRegexes = common.ensureArray(ignore)

    return function filterByRegexes (file) {
      return !ignoredRegexes.some(regex => file.match(regex))
    }
  }
}

function userPathFilter (opts) {
  const filterFunc = generateFilterFunction(opts.ignore || [])
  const ignoredOutDirs = generateIgnoredOutDirs(opts)
  const pruner = opts.prune ? new prune.Pruner(opts.dir) : null

  return async function filter (file) {
    const fullPath = path.resolve(file)

    if (ignoredOutDirs.includes(fullPath)) {
      return false
    }

    if (opts.junk !== false) { // defaults to true
      if (junk.is(path.basename(fullPath))) {
        return false
      }
    }

    let name = fullPath.split(path.resolve(opts.dir))[1]

    if (path.sep === '\\') {
      name = common.normalizePath(name)
    }

    if (pruner && name.startsWith('/node_modules/')) {
      if (await prune.isModule(file)) {
        return pruner.pruneModule(name)
      } else {
        return filterFunc(name)
      }
    }

    return filterFunc(name)
  }
}

module.exports = {
  populateIgnoredPaths,
  generateIgnoredOutDirs,
  userPathFilter
}
