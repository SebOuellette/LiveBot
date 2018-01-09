const mimes = require('./mimes.json');
const mimeOfBuffer = require('./mimeOfBuffer.js');

function lookupMime(ext) {
  return mimes[ext.replace(/^\./, '')] || mimes.bin;
}

function lookupBuffer(buffer) {
  const ret = mimeOfBuffer(buffer);
  return ret ? ret.mime : mimes.bin;
}

module.exports = {
  buffer: lookupBuffer,
  lookup: lookupMime,
};
