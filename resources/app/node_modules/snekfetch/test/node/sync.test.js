/**
 * @jest-environment node
 */

const { SnekfetchSync, TestRoot } = require('../interop');

test('sync get', SnekfetchSync && (() => {
  const res = SnekfetchSync.get(`${TestRoot}/get`).end();
  expect(res.body).not.toBeUndefined();
}));
