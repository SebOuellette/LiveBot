const fs = require('fs');
const path = require('path');
const mime = require('../mime');
const EventEmitter = require('events');
const ResponseStream = require('./ResponseStream');

const methods = {
  GET: (filename, req) => {
    req.end = () => {
      const stream = should404(filename) ?
        new ResponseStream().error(404, `ENOENT: no such file or directory, open '${filename}'`) :
        fs.createReadStream(filename);
      req.res = stream;
      stream.headers = {
        'content-length': 0,
        'content-type': mime.lookup(path.extname(filename)),
      };
      stream.on('open', () => {
        req.emit('response', stream);
      });
      if (stream instanceof ResponseStream)
        return;
      stream.statusCode = 200;
      stream.on('end', () => {
        stream.headers['content-length'] = stream.bytesRead;
      });
      /* istanbul ignore next */
      stream.on('error', (err) => {
        stream.statusCode = 400;
        stream.status = err.message;
      });
    };
  },
  POST: (filename, req) => {
    const chunks = [];
    /* istanbul ignore next */
    req.write = (data) => {
      chunks.push(data);
    };
    req.end = (data) => {
      chunks.push(data);
      const stream = fs.createWriteStream(filename);
      const standin = new ResponseStream();
      req.res = standin;
      standin.headers = {
        'content-length': 0,
        'content-type': mime.lookup(path.extname(filename)),
      };
      stream.on('finish', () => {
        req.emit('response', standin);
      });
      stream.on('open', () => {
        (function write() {
          const chunk = chunks.shift();
          if (!chunk)
            return;
          /* istanbul ignore next */
          if (!stream.write(chunk))
            stream.once('drain', write);
          else
            write();
        }());
        stream.end();
      });
    };
  },
  DELETE: (filename, req) => {
    req.end = () => {
      const stream = new ResponseStream();
      req.res = stream;
      stream.headers = {
        'content-length': 0,
        'content-type': mime.lookup(path.extname(filename)),
      };
      fs.unlink(filename, (err) => {
        req.emit('response', err ? stream.error(400, err.message) : stream);
      });
    };
  },
};

class Req extends EventEmitter {
  constructor() {
    super();
    this._headers = {};
  }

  setHeader() {} // eslint-disable-line no-empty-function
  getHeader() {} // eslint-disable-line no-empty-function
}

function request(options) {
  const method = methods[options.method];
  if (!method)
    throw new Error(`Invalid request method for file: "${options.method}"`);
  const filename = options.href.replace('file://', '');

  const req = new Req();
  method(filename, req, options);
  return req;
}

function should404(p) {
  try {
    return fs.lstatSync(p).isDirectory();
  } catch (err) {
    return true;
  }
}

module.exports = {
  request,
};
