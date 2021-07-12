'use strict'

const extractZip = require('extract-zip')

module.exports = async function extractElectronZip (zipPath, targetDir) {
  await extractZip(zipPath, { dir: targetDir })
}
