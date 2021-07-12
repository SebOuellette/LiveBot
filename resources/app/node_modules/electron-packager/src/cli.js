'use strict'

const { hostInfo, warning } = require('./common')
const fs = require('fs-extra')
const { initializeProxy } = require('@electron/get')
const packager = require('..')
const path = require('path')
const yargs = require('yargs-parser')

/* istanbul ignore next */
async function printUsageAndExit (isError) {
  const usage = (await fs.readFile(path.resolve(__dirname, '..', 'usage.txt'))).toString()
  const print = isError ? console.error : console.log
  print(usage)
  process.exit(isError ? 1 : 0)
}

module.exports = {
  parseArgs: function parseArgs (argv) {
    const args = yargs(argv, {
      boolean: [
        'all',
        'deref-symlinks',
        'download.rejectUnauthorized',
        'junk',
        'overwrite',
        'prune',
        'quiet'
      ],
      default: {
        'deref-symlinks': true,
        'download.rejectUnauthorized': true,
        junk: true,
        prune: true
      },
      string: [
        'electron-version',
        'out'
      ]
    })

    args.dir = args._[0]
    args.name = args._[1]

    const protocolSchemes = [].concat(args.protocol || [])
    const protocolNames = [].concat(args.protocolName || [])

    if (protocolSchemes && protocolNames && protocolNames.length === protocolSchemes.length) {
      args.protocols = protocolSchemes.map(function (scheme, i) {
        return { schemes: [scheme], name: protocolNames[i] }
      })
    }

    if (args.out === '') {
      warning('Specifying --out= without a value is the same as the default value')
      args.out = null
    }

    // Overrides for multi-typed arguments, because minimist doesn't support it

    // asar: `Object` or `true`
    if (args.asar === 'true' || args.asar instanceof Array) {
      warning('--asar does not take any arguments, it only has sub-properties (see --help)')
      args.asar = true
    }

    // osx-sign: `Object` or `true`
    if (args.osxSign === 'true') {
      warning('--osx-sign does not take any arguments, it only has sub-properties (see --help)')
      args.osxSign = true
    } else if (typeof args['osx-sign'] === 'object') {
      if (Array.isArray(args['osx-sign'])) {
        warning('Remove --osx-sign (the bare flag) from the command line, only specify sub-properties (see --help)')
      } else {
        // Keep kebab case of sub properties
        args.osxSign = args['osx-sign']
      }
    }

    if (args.osxNotarize) {
      let notarize = true
      if (typeof args.osxNotarize !== 'object' || Array.isArray(args.osxNotarize)) {
        warning('--osx-notarize does not take any arguments, it only has sub-properties (see --help)')
        notarize = false
      } else if (!args.osxSign) {
        warning('Notarization was enabled but macOS code signing was not, code signing is a requirement for notarization, notarize will not run')
        notarize = false
      }

      if (!notarize) {
        args.osxNotarize = null
      }
    }

    // tmpdir: `String` or `false`
    if (args.tmpdir === 'false') {
      warning('--tmpdir=false is deprecated, use --no-tmpdir instead')
      args.tmpdir = false
    }

    return args
  },
  run: /* istanbul ignore next */ async function run (argv) {
    const args = module.exports.parseArgs(argv)

    // temporary fix for https://github.com/nodejs/node/issues/6456
    for (const stdioWriter of [process.stdout, process.stderr]) {
      if (stdioWriter._handle && stdioWriter._handle.setBlocking) {
        stdioWriter._handle.setBlocking(true)
      }
    }

    if (args.help) {
      await printUsageAndExit(false)
    } else if (args.version) {
      if (typeof args.version !== 'boolean') {
        console.error('--version does not take an argument. Perhaps you meant --app-version or --electron-version?\n')
      }
      console.log(hostInfo())
      process.exit(0)
    } else if (!args.dir) {
      await printUsageAndExit(true)
    }

    initializeProxy()

    try {
      const appPaths = await packager(args)
      if (appPaths.length > 1) {
        console.error(`Wrote new apps to:\n${appPaths.join('\n')}`)
      } else if (appPaths.length === 1) {
        console.error('Wrote new app to', appPaths[0])
      }
    } catch (err) {
      if (err.message) {
        console.error(err.message)
      } else {
        console.error(err, err.stack)
      }
      process.exit(1)
    }
  }
}
