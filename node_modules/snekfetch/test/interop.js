function makeProxy(fetch) {
  return new Proxy(fetch, {
    get(target, prop) {
      const p = target[prop];
      if (typeof p === 'function') {
        return (url, options = {}) =>
          p.call(target, url, Object.assign(options, { version: global.HTTP_VERSION }));
      }
      return p;
    },
  });
}

exports.Snekfetch = makeProxy(require('../'));
exports.SnekfetchSync = makeProxy(require('../sync'));

exports.TestRoot = global.HTTP_VERSION === 2 ?
  'https://nghttp2.org/httpbin' :
  'https://httpbin.org';

