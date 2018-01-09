/* global test expect */

const { Snekfetch, TestRoot } = require('./interop');

const server = require('./server');

function makeTestObj({ unicode = true, numbers = false } = {}) {
  const test = {
    Hello: 'world',
    Test: numbers ? 1337 : '1337',
  };
  if (unicode)
    test.Unicode = '( ͡° ͜ʖ ͡°)';
  return {
    test,
    check: (obj) => {
      expect(obj).not.toBeUndefined();
      expect(obj.Hello).toBe(test.Hello);
      expect(obj.Test).toBe(test.Test);
      if (test.Unicode)
        expect(obj.Unicode).toBe(test.Unicode);
    },
  };
}

test('should return a promise', () => {
  expect(Snekfetch.get(`${TestRoot}/get`).end())
    .toBeInstanceOf(Promise);
});

test('should reject with error on network failure', () => {
  const invalid = 'http://localhost:0/';
  /* https://gc.gy/❥ȗ.png
   return expect(Snekfetch.get(invalid).end())
    .rejects.toBeInstanceOf(Error);*/
  return Snekfetch.get(invalid).catch((err) => {
    expect(err.name).toMatch(/(Fetch)?Error/);
  });
});

test('should resolve on success', () =>
  Snekfetch.get(`${TestRoot}/get`).then((res) => {
    expect(res.status).toBe(200);
    expect(res.ok).toBe(true);
    expect(res).toHaveProperty('text');
    expect(res).toHaveProperty('body');
  })
);

test('end should work', () =>
  Snekfetch.get(`${TestRoot}/get`).end((err, res) => {
    expect(err).toBe(null);
    expect(res.body).not.toBeUndefined();
  })
);

test('should reject if response is not between 200 and 300', () =>
  Snekfetch.get(`${TestRoot}/404`).catch((err) => {
    expect(err.status).toBe(404);
    expect(err.ok).toBe(false);
  })
);

test('unzipping works', () =>
  Snekfetch.get(`${TestRoot}/gzip`)
    .then((res) => {
      expect(res.body).not.toBeUndefined();
      expect(res.body.gzipped).toBe(true);
    })
);

test('query should work', () => {
  const { test, check } = makeTestObj();
  Promise.all([
    Snekfetch.get(`${TestRoot}/get?inline=true`)
      .query(test).end(),
    Snekfetch.get(`${TestRoot}/get?inline=true`, { query: test })
      .end(),
  ])
    .then((ress) => {
      for (const res of ress) {
        const { args } = res.body;
        check(args);
        expect(args.inline).toBe('true');
      }
    });
});

test('set should work', () => {
  const { test, check } = makeTestObj({ unicode: false });
  return Snekfetch.get(`${TestRoot}/get`)
    .set(test)
    .then((res) => check(res.body.headers));
});

test('attach should work', () => {
  const { test, check } = makeTestObj();
  return Snekfetch.post(`${TestRoot}/post`)
    .attach(test)
    .then((res) => check(res.body.form));
});

test('send should work with json', () => {
  const { test, check } = makeTestObj({ numbers: true });
  return Promise.all([
    Snekfetch.post(`${TestRoot}/post`)
      .send(test).end(),
    Snekfetch.post(`${TestRoot}/post`, { data: test })
      .end(),
  ])
    .then((ress) => {
      for (const res of ress)
        check(res.body.json);
    });
});

test('send should work with urlencoded', () => {
  const { test, check } = makeTestObj();
  return Snekfetch.post(`${TestRoot}/post`)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(test)
    .then((res) => check(res.body.form));
});

test('invalid json is just text', () =>
  Snekfetch.get(`http://localhost:${server.port}/invalid-json`)
    .then((res) => {
      expect(res.body).toBe('{ "a": 1');
    })
);

test('x-www-form-urlencoded response body', () =>
  Snekfetch.get(`http://localhost:${server.port}/form-urlencoded`)
    .then((res) => {
      const { body } = res;
      expect(body.test).toBe('1');
      expect(body.hello).toBe('world');
    })
);

test('redirects', () =>
  Snekfetch.get(`${TestRoot}/redirect/1`)
    .then((res) => {
      expect(res.body).not.toBeUndefined();
      expect(res.body.url).toBe(`${TestRoot}/get`);
    })
);
