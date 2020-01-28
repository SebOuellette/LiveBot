/* eslint no-console: 0 */
const Prism = require('../');
const fs = require('fs');

const prism = new Prism();

const transcoder = prism.transcode({
  type: 'ffmpeg',
  media: './test/test.mp3',
  ffmpegArguments: [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
  ],
});

transcoder.output.pipe(fs.createWriteStream('./test/test.pcm'));
