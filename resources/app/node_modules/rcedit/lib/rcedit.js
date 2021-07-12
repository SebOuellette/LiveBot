const os = require('os')
const path = require('path')
const { spawn } = require('child_process')

const pairSettings = ['version-string']
const singleSettings = ['file-version', 'product-version', 'icon', 'requested-execution-level']
const noPrefixSettings = ['application-manifest']

module.exports = async (exe, options) => {
  let rcedit = path.resolve(__dirname, '..', 'bin', process.arch === 'x64' ? 'rcedit-x64.exe' : 'rcedit.exe')
  const args = [exe]

  for (const name of pairSettings) {
    if (options[name]) {
      for (const [key, value] of Object.entries(options[name])) {
        args.push(`--set-${name}`, key, value)
      }
    }
  }

  for (const name of singleSettings) {
    if (options[name]) {
      args.push(`--set-${name}`, options[name])
    }
  }

  for (const name of noPrefixSettings) {
    if (options[name]) {
      args.push(`--${name}`, options[name])
    }
  }

  const spawnOptions = {
    env: { ...process.env }
  }

  // Use Wine on non-Windows platforms except for WSL, which doesn't need it
  if (process.platform !== 'win32' && !os.release().endsWith('Microsoft')) {
    args.unshift(rcedit)
    rcedit = process.arch === 'x64' ? 'wine64' : 'wine'
    // Suppress "fixme:" stderr log messages
    spawnOptions.env.WINEDEBUG = '-all'
  }

  return new Promise((resolve, reject) => {
    const child = spawn(rcedit, args, spawnOptions)
    let stderr = ''
    let error = null

    child.on('error', err => {
      if (error === null) {
        error = err
      }
    })

    child.stderr.on('data', data => {
      stderr += data
    })

    child.on('close', code => {
      if (error !== null) {
        reject(error)
      } else if (code === 0) {
        resolve()
      } else {
        let message = `rcedit.exe failed with exit code ${code}`
        stderr = stderr.trim()
        if (stderr) {
          message += `. ${stderr}`
        }
        reject(new Error(message))
      }
    })
  })
}
