const Stream = require('stream');

class ResponseStream extends Stream.Readable {
  constructor() {
    super();
    this.statusCode = 200;
    this.status = 'OK';
  }

  error(code, message) {
    this.statusCode = code;
    this.status = message;
    return this;
  }

  on(event, handler) {
    if (['end', 'open'].includes(event))
      handler();
  }

  _read() {} // eslint-disable-line no-empty-function
}

module.exports = ResponseStream;
