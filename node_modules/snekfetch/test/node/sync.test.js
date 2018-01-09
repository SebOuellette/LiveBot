/**
 * @jest-environment node
 */

/* global test expect */

const { SnekfetchSync, TestRoot } = require('../interop');

test('sync get', () => {
  const res = SnekfetchSync.get(`${TestRoot}/get`).end();
  expect(res.body).not.toBeUndefined();
});
