const EventEmitter = require('events').EventEmitter;
const ChildProcess = require('child_process');

/**
 * A spawned FFMPEG process
 */
class FfmpegProcess extends EventEmitter {
  constructor(ffmpegTranscoder, options) {
    super();
    /**
     * The ffmpeg process
     * @type {ChildProcess}
     */
    this.process = ChildProcess.spawn(ffmpegTranscoder.command, options.ffmpegArguments);
    /**
     * The FFMPEG transcoder that created this process
     * @type {FfmpegTranscoder}
     */
    this.transcoder = ffmpegTranscoder;
    /**
     * The input media
     * @type {?ReadableStream|string}
     */
    this.inputMedia = options.media;

    if (typeof this.inputMedia !== 'string') {
      try {
        this.connectStream(this.inputMedia);
      } catch (e) {
        this.emit('error', e, 'instantiation');
      }
    } else {
      this.attachErrorHandlers();
    }

    this.on('error', this.kill.bind(this));
    this.once('end', this.kill.bind(this));
  }

  /**
   * The ffmpeg output stream
   * @type {?ReadableStream}
   */
  get output() {
    return this.process ? this.process.stdout : null;
  }

  attachErrorHandlers() {
    this.process.stdin.on('error', e => {
      // if not killed
      if (this.process) {
        this.emit('error', e, 'ffmpegProcess.stdin');
      }
    });
    this.process.stdout.on('error', e => {
      // if not killed
      if (this.process) {
        this.emit('error', e, 'ffmpegProcess.stdout');
      }
    });
    this.process.on('error', e => this.emit('error', e, 'ffmpegProcess'));
    this.process.stdout.on('end', () => this.emit('end'));
  }

  /**
   * Connects an input stream to the ffmpeg process
   * @param {ReadableStream} inputMedia the stream to pass to ffmpeg
   * @returns {ReadableStream} the ffmpeg output stream
   */
  connectStream(inputMedia) {
    if (!this.process) throw new Error('No FFMPEG process available');
    this.inputMedia = inputMedia;
    this.inputMedia.pipe(this.process.stdin, { end: false });

    inputMedia.on('error', e => this.emit('error', e, 'inputstream', inputMedia));

    this.attachErrorHandlers();

    return this.process.stdout;
  }

  /**
   * Kills the ffmpeg process
   */
  kill() {
    if (!this.process) return;
    if (this.inputMedia && this.inputMedia.unpipe) {
      this.inputMedia.unpipe(this.process.stdin);
    }
    this.process.kill('SIGKILL');
    this.process = null;
  }
}

module.exports = FfmpegProcess;
