import test from 'node:test';
import assert from 'node:assert/strict';

import { createLazyFeatureProxy } from '../app/scripts/services/lazy-feature-proxy.js';

test('lazy feature proxy caches the loaded feature and returns fallbacks while loading', async () => {
  let loadCount = 0;
  const calls = [];
  const proxy = createLazyFeatureProxy({
    loadFeature: async () => {
      loadCount += 1;
      return {
        ping: (value) => {
          calls.push(value);
          return `pong:${value}`;
        },
      };
    },
  });

  const ping = proxy.method('ping', 'loading');

  assert.equal(ping('first'), 'loading');
  assert.equal(loadCount, 1);
  await proxy.getFeature();
  assert.equal(await ping('second'), 'pong:second');
  assert.equal(loadCount, 1);
  assert.equal(ping('third'), 'pong:third');
  assert.deepEqual(calls, ['first', 'second', 'third']);
});

test('lazy feature proxy exposes grouped methods through the same cached feature', async () => {
  let loadCount = 0;
  const calls = [];
  const proxy = createLazyFeatureProxy({
    loadFeature: async () => {
      loadCount += 1;
      return {
        first: (value) => {
          calls.push(['first', value]);
          return `first:${value}`;
        },
        second: (value) => {
          calls.push(['second', value]);
          return `second:${value}`;
        },
      };
    },
  });

  const methods = proxy.methods(['first', 'second']);

  assert.deepEqual(Object.keys(methods), ['first', 'second']);
  assert.equal(loadCount, 0);
  assert.equal(await methods.first('a'), 'first:a');
  assert.equal(await methods.second('b'), 'second:b');
  assert.equal(loadCount, 1);
  assert.deepEqual(calls, [['first', 'a'], ['second', 'b']]);
});
