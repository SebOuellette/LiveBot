/**
 * @jest-environment node
 */

/* global test expect */

const fs = require('fs');
const { Snekfetch } = require('../interop');

const resolve = (x) => require.resolve(x);

test('node/file get', () => {
  const original = fs.readFileSync(resolve('../../package.json')).toString();
  return Snekfetch.get(`file://${resolve('../../package.json')}`)
    .then((res) => {
      expect(res.text).toBe(original);
    });
});

test('node/file post', () => {
  const content = 'wow this is a\n\ntest!!';
  const file = './test_file_post.txt';
  return Snekfetch.post(`file://${file}`)
    .send(content)
    .then(() => Snekfetch.get(`file://${file}`))
    .then((res) => {
      expect(res.text).toBe(content);
    })
    .then(() => {
      fs.unlinkSync(file);
    });
});

test('node/file delete', () => {
  const file = './test_file_delete.txt';
  fs.closeSync(fs.openSync(file, 'w'));
  expect(fs.existsSync(file)).toBe(true);
  return Snekfetch.delete(`file://${file}`)
    .then(() => {
      expect(fs.existsSync(file)).toBe(false);
    });
});


test('node/file invalid method', () => {
  expect(() => {
    Snekfetch.options('file:///dev/urandom');
  }).toThrow(/Invalid request method for file:/);
});
