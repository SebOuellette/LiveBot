const path = require('path');
const mime = require('./mime');

class FormData {
  constructor() {
    this.boundary = `--snekfetch--${Math.random().toString().slice(2, 7)}`;
    this.buffers = [];
  }

  append(name, data, filename) {
    if (typeof data === 'undefined')
      return;
    let str = `\r\n--${this.boundary}\r\nContent-Disposition: form-data; name="${name}"`;
    let mimetype = null;
    if (filename) {
      str += `; filename="${filename}"`;
      mimetype = 'application/octet-stream';
      const extname = path.extname(filename).slice(1);
      if (extname)
        mimetype = mime.lookup(extname);
    }

    if (data instanceof Buffer) {
      mimetype = mime.buffer(data);
    } else if (typeof data === 'object') {
      mimetype = 'application/json';
      data = Buffer.from(JSON.stringify(data));
    } else {
      data = Buffer.from(String(data));
    }

    if (mimetype)
      str += `\r\nContent-Type: ${mimetype}`;
    this.buffers.push(Buffer.from(`${str}\r\n\r\n`));
    this.buffers.push(data);
  }

  getBoundary() {
    return this.boundary;
  }

  end() {
    return Buffer.concat([...this.buffers, Buffer.from(`\r\n--${this.boundary}--`)]);
  }

  get length() {
    return this.buffers.reduce((sum, b) => sum + Buffer.byteLength(b), 0);
  }
}

module.exports = FormData;
