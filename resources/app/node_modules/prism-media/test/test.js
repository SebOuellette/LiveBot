const fs = require('fs');
const OggOpusTransform = require('../src/opus/OggOpus');
const opus = require('node-opus');

const decoder = new opus.Decoder(48000, 2, 1920);

const transformer = new OggOpusTransform();

fs.createReadStream('./test/ts.ogg')
  .pipe(transformer)
  .pipe(decoder)
  .pipe(fs.createWriteStream('./output.opus'));
