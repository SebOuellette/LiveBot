const Ffmpeg = require('./ffmpeg/Ffmpeg');

const transcoders = [
  'ffmpeg',
];

class MediaTranscoder {
  constructor(prism) {
    this.prism = prism;
    this.ffmpeg = new Ffmpeg(this);
  }

  static verifyOptions(options) {
    if (!options) throw new Error('Options must be passed to MediaTranscoder.transcode()');
    if (!options.type) throw new Error('Options.type must be passed to MediaTranscoder.transcode()');
    if (!transcoders.includes(options.type)) throw new Error(`Options.type must be: ${transcoders.join(' ')}`);
    return options;
  }

  /**
   * Transcodes a media stream based on specified options
   * @param {Object} options the options to use when transcoding
   * @returns {ReadableStream} the transcodeed stream
   */
  transcode(options) {
    options = MediaTranscoder.verifyOptions(options);
    return this[options.type].transcode(options);
  }
}

module.exports = MediaTranscoder;
