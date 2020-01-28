const ChildProcess = require('child_process');
const FfmpegProcess = require('./FfmpegProcess');

class FfmpegTranscoder {
  constructor(mediaTranscoder) {
    this.mediaTranscoder = mediaTranscoder;
    this.command = FfmpegTranscoder.selectFfmpegCommand();
    this.processes = [];
  }

  static verifyOptions(options) {
    if (!options) throw new Error('Options not provided!');
    if (!options.media) throw new Error('Media must be provided');
    if (!options.ffmpegArguments || !(options.ffmpegArguments instanceof Array)) {
      throw new Error('FFMPEG Arguments must be an array');
    }
    if (options.ffmpegArguments.includes('-i')) return options;
    if (typeof options.media === 'string') {
      options.ffmpegArguments = ['-i', `${options.media}`].concat(options.ffmpegArguments).concat(['pipe:1']);
    } else {
      options.ffmpegArguments = ['-i', '-'].concat(options.ffmpegArguments).concat(['pipe:1']);
    }
    return options;
  }

  /**
   * Transcodes an input using FFMPEG
   * @param {FfmpegTranscoderOptions} options the options to use
   * @returns {FfmpegProcess} the created FFMPEG process
   * @throws {FFMPEGOptionsError}
   */
  transcode(options) {
    if (!this.command) this.command = FfmpegTranscoder.selectFfmpegCommand();
    const proc = new FfmpegProcess(this, FfmpegTranscoder.verifyOptions(options));
    this.processes.push(proc);
    return proc;
  }

  static selectFfmpegCommand() {
    try {
      return require('ffmpeg-binaries');
    } catch (err) {
      for (const command of ['ffmpeg', 'avconv', './ffmpeg', './avconv']) {
        if (!ChildProcess.spawnSync(command, ['-h']).error) return command;
      }
      throw new Error('FFMPEG not found');
    }
  }
}

module.exports = FfmpegTranscoder;
