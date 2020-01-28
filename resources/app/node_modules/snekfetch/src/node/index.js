const zlib = require('zlib');
const http = require('http');
const https = require('https');
const URL = require('url');
const Stream = require('stream');
const FormData = require('./FormData');

const Package = require('../../package.json');

const transports = {
  'http:': http,
  'https:': https,
  'file:': require('./transports/file'),
};

function buildRequest(method, url) {
  /* istanbul ignore next */
  this._read = () => {
    this.resume();
    if (this._response)
      return;
    this.catch((err) => this.emit('error', err));
  };

  this.options.lastBuiltUrl = url;

  const options = URL.parse(url);
  options.encoding = 'utf8';

  if (!options.protocol)
    throw new Error('URL must have a valid protocol');

  const transport = transports[options.protocol];
  options.method = method.toUpperCase();

  if (this.options.headers)
    options.headers = this.options.headers;

  if (this.options.agent)
    options.agent = this.options.agent;
  else if (transport.Agent && this.options.followRedirects !== false)
    options.agent = new transport.Agent({ keepAlive: true });

  if (options.port)
    options.port = parseInt(options.port);

  this.options._req = options;
  const request = transport.request(options);
  if (request.setNoDelay)
    request.setNoDelay(true);
  return request;
}

function finalizeRequest() {
  return new Promise((resolve, reject) => {
    const request = this.request;

    let socket;

    const handleError = (err) => {
      if (!err)
        err = new Error('Unknown error occured');
      err.request = request;
      reject(err);
      if (socket)
        socket.removeListener('error', handleError);
    };

    request.once('abort', handleError);
    request.once('error', handleError);
    request.once('socket', (s) => {
      socket = s;
      s.once('error', handleError);
    });

    request.once('response', (response) => {
      if (socket)
        socket.removeListener('error', handleError);
      let stream = response;
      if (shouldUnzip(response)) {
        stream = response.pipe(zlib.createUnzip({
          flush: zlib.Z_SYNC_FLUSH,
          finishFlush: zlib.Z_SYNC_FLUSH,
        }));
      }

      if (this.options.followRedirects !== false && [301, 302, 303, 307, 308].includes(response.statusCode)) {
        resolve({
          response,
          redirect: URL.resolve(this.options.lastBuiltUrl, response.headers.location),
        });
        response.destroy();
      } else {
        const body = [];

        stream.on('data', (chunk) => {
          if (!this.push(chunk))
            this.pause();
          body.push(chunk);
        });

        stream.once('end', () => {
          this.push(null);
          const raw = Buffer.concat(body);
          resolve({ response, raw, redirect: false });
        });
      }
    });

    if (!this.request.getHeader('user-agent'))
      this.set('User-Agent', `snekfetch/${Package.version} (${Package.homepage})`);

    this._finalizeRequest();
    let data = this.data;
    if (data && data.end)
      data = data.end();
    if (Array.isArray(data)) {
      for (const chunk of data)
        request.write(chunk);
      request.end();
    } else if (data instanceof Stream) {
      data.pipe(request);
    } else if (data instanceof Buffer) {
      request.end(data);
    } else if (data) {
      request.end(data);
    } else {
      request.end();
    }
  });
}

function shouldSendRaw(data) {
  return data instanceof Buffer || data instanceof Stream;
}

function shouldUnzip(res) {
  if (res.statusCode === 204 || res.statusCode === 304)
    return false;
  if (res.headers['content-length'] === '0')
    return false;
  return /^\s*(?:deflate|gzip)\s*$/.test(res.headers['content-encoding']);
}

module.exports = {
  buildRequest, finalizeRequest, shouldSendRaw,
  METHODS: http.METHODS,
  STATUS_CODES: http.STATUS_CODES,
  FormData,
  Extension: Stream.Readable,
};
