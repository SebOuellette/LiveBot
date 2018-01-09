const http = require('http');
const Stream = require('stream');
const EventEmitter = require('events');
const http2 = (() => {
  try {
    const h2 = require('http2');
    if (!h2.constants)
      throw new Error('DAMN_YOU_NPM_HTTP2');
    return h2;
  } catch (err) {
    return {
      constants: {},
      connect: () => {
        throw new Error('Please run node with --expose-http2 to use the http2 request transport');
      },
    };
  }
})();

const {
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_STATUS,
} = http2.constants;

class Http2Request extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this._headers = {
      [HTTP2_HEADER_PATH]: options.pathname,
      [HTTP2_HEADER_METHOD]: options.method.toUpperCase(),
    };
  }

  setHeader(name, value) {
    this._headers[name.toLowerCase()] = value;
  }

  getHeader(name) {
    return this._headers[name];
  }

  getHeaders() {
    return this._headers;
  }

  get path() {
    return this._headers[HTTP2_HEADER_PATH];
  }

  set path(path) {
    this._headers[HTTP2_HEADER_PATH] = path;
  }

  end(data) {
    const options = this.options;
    const client = http2.connect(`${options.protocol}//${options.hostname}`);
    const req = client.request(this._headers);
    const stream = new Stream.PassThrough();

    client.once('error', (e) => this.emit('error', e));
    client.once('frameError', (e) => this.emit('error', e));

    req.once('error', (e) => this.emit('error', e));

    req.once('response', (headers) => {
      stream.headers = headers;
      stream.statusCode = headers[HTTP2_HEADER_STATUS];
      stream.status = http.STATUS_CODES[stream.statusCode];

      this.emit('response', stream);
      this.response = stream;

      req.on('data', (chunk) => {
        if (!stream.push(chunk))
          req.pause();
      });

      req.once('end', () => {
        stream.push(null);
        client.destroy();
      });

      stream.once('error', (err) => {
        stream.statusCode = 400;
        stream.status = err.message;
      });
    });

    req.end(data);

    return req;
  }
}


function request(options) {
  return new Http2Request(options);
}

module.exports = { request };
