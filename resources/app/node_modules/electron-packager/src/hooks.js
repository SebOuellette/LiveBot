'use strict'

const { promisify } = require('util')

module.exports = {
  promisifyHooks: async function promisifyHooks (hooks, args) {
    if (!hooks || !Array.isArray(hooks)) {
      return Promise.resolve()
    }

    await Promise.all(hooks.map(hookFn => promisify(hookFn).apply(this, args)))
  },
  serialHooks: function serialHooks (hooks) {
    return async function () {
      const args = Array.prototype.splice.call(arguments, 0, arguments.length - 1)
      const done = arguments[arguments.length - 1]
      for (const hook of hooks) {
        await hook.apply(this, args)
      }

      return done() // eslint-disable-line promise/no-callback-in-promise
    }
  }
}
