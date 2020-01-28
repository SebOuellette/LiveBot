try {
  var syncify = require('@snek/syncify');
} catch (err) {
  throw new Error('Using sync requires @snek/syncify (npm install @snek/syncify)');
}

const Snekfetch = require('.');

class SnekfetchSync extends Snekfetch {
  end() {
    return syncify(super.end());
  }
}

module.exports = SnekfetchSync;
