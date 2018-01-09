/* global test expect */

const FormData = require('../../src/node/FormData');
const mime = require('../../src/node/mime');

test('node/FormData behaves predictably', () => {
  const f = new FormData();
  f.append('hello');
  f.append('hello', 'world');
  expect(f.length).toBe(77);
  f.append('meme', 'dream', 'name');
  expect(f.length).toBe(210);
});

test('node/mimes behaves predictably', () => {
  expect(mime.lookup('js')).toBe('application/javascript');
  expect(mime.lookup('nope')).toBe('application/octet-stream');
  expect(mime.buffer([0xFF, 0xD8, 0xFF])).toBe('image/jpeg');
});
