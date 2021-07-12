#!/usr/bin/env node

'use strict'

/* eslint-disable no-var */
// WHY: not consts so that this file can load in Node < 4.0
var packageJSON = require('../package.json')
var semver = require('semver')
if (!semver.satisfies(process.versions.node, packageJSON.engines.node)) {
  console.error('CANNOT RUN WITH NODE ' + process.versions.node)
  console.error('Electron Packager requires Node ' + packageJSON.engines.node + '.')
  process.exit(1)
}

var cli = require('../src/cli')
cli.run(process.argv.slice(2))
