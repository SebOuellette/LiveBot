function buildRequest(method, url) {
  return {
    method,
    path: url,
    redirect: this.options.followRedirects ? 'follow' : 'manual',
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
  };
}

function finalizeRequest() {
  this._finalizeRequest();
  if (this.data)
    this.request.body = this.data;
  return window.fetch(this.request.path, this.request)
    .then((r) => r.text().then((t) => {
      const headers = {};
      for (const [k, v] of r.headers.entries())
        headers[k.toLowerCase()] = v;
      return { response: r, raw: t, headers };
    }));
}

module.exports = {
  buildRequest, finalizeRequest,
  shouldSendRaw: () => false,
  METHODS: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'PATCH'],
  STATUS_CODES: {},
  Extension: Object,
  FormData: window.FormData,
};
