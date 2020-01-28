const { Transform } = require('stream');

const OGG_PAGE_HEADER_SIZE = 26;
const STREAM_STRUCTURE_VERSION = 0;

const OGGS_HEADER = Buffer.from('OggS'.split('').map(x => x.charCodeAt(0)));
const OPUS_HEAD = Buffer.from('OpusHead'.split('').map(x => x.charCodeAt(0)));
const OPUS_TAGS = Buffer.from('OpusTags'.split('').map(x => x.charCodeAt(0)));

class OggOpusTransform extends Transform {
  constructor() {
    super();
    this._remainder = null;
    this._head = null;
  }

  _transform(chunk, encoding, done) {
    if (this._remainder) {
      chunk = Buffer.concat([this._remainder, chunk]);
      this._remainder = null;
    }

    while (chunk) {
      try {
        const result = this.readPage(chunk);
        if (result) chunk = result;
        else break;
      } catch (err) {
        this.emit('error', err);
      }
    }
    this._remainder = chunk;
    done();
  }

  /**
   * Reads a page from a buffer
   * @param {Buffer} chunk The chunk containing the page
   * @returns {boolean|Buffer}
   */
  readPage(chunk) {
    if (chunk.length < OGG_PAGE_HEADER_SIZE) {
      return false;
    }
    if (!chunk.slice(0, 4).equals(OGGS_HEADER)) {
      throw Error(`capture_pattern is not ${OGGS_HEADER}`);
    }
    if (chunk.readUInt8(4) !== STREAM_STRUCTURE_VERSION) {
      throw Error(`stream_structure_version is not ${STREAM_STRUCTURE_VERSION}`);
    }

    const pageSegments = chunk.readUInt8(26),
      table = chunk.slice(27, 27 + pageSegments);

    let sizes = [], totalSize = 0;

    for (let i = 0; i < pageSegments;) {
      let size = 0, x = 255;
      while (x === 255) {
        x = table.readUInt8(i);
        i++;
        size += x;
      }
      sizes.push(size);
      totalSize += size;
    }

    if (chunk.length < 27 + pageSegments + totalSize) {
      return false;
    }

    let start = 27 + pageSegments;
    for (const size of sizes) {
      const segment = chunk.slice(start, start + size);
      const header = segment.slice(0, 8);
      if (this._head) {
        if (header.equals(OPUS_TAGS)) this.emit('opusTags', segment);
        else this.push(segment);
      } else if (header.equals(OPUS_HEAD)) {
        this._head = segment;
      } else {
        throw Error(`Invalid segment ${segment}`);
      }
      start += size;
    }
    return chunk.slice(start);
  }
}

module.exports = OggOpusTransform;
