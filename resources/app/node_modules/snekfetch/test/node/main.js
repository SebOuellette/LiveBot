const fs = require('fs');

const { Snekfetch, TestRoot } = require('../interop');

require('../main');

test('node/pipe get', (done) => {
  Snekfetch.get(`${TestRoot}/get`)
    .pipe(fs.createWriteStream('/dev/null'))
    .on('finish', done);
});


test('node/FormData json works', () =>
  Snekfetch.post(`${TestRoot}/post`)
    .attach('object', { a: 1 })
    .then((res) => {
      const { form } = res.body;
      expect(form.object).toBe('{"a":1}');
    })
);

test('node/rawsend post', () =>
  Snekfetch.post(`${TestRoot}/post`)
    .send(Buffer.from('memes')).end()
);
