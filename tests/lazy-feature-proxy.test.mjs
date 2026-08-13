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

test('isLoaded stays false until the feature resolves and never triggers the load', async () => {
  let loadCount = 0;
  let resolveLoad;
  const proxy = createLazyFeatureProxy({
    loadFeature: () => {
      loadCount += 1;
      return new Promise((resolve) => { resolveLoad = resolve; });
    },
  });

  // 未加载：isLoaded false，且反复检查不触发动态 import
  for (let i = 0; i < 100; i += 1) {
    assert.equal(proxy.isLoaded(), false, 'isLoaded must be false before the load resolves');
  }
  assert.equal(loadCount, 0, 'checking isLoaded must never trigger the dynamic import');

  // 加载中（已有人触发 getFeature）：isLoaded 仍 false，不抛、不拉第二次
  const pending = proxy.getFeature();
  assert.equal(proxy.isLoaded(), false, 'isLoaded must stay false while the import is in flight');
  assert.equal(loadCount, 1);

  resolveLoad({ ping: () => 'pong' });
  await pending;
  assert.equal(proxy.isLoaded(), true, 'isLoaded must flip true once the feature resolves');
  assert.equal(loadCount, 1, 'no second import after resolution');
});

test('isLoaded stays false after a failed load, and the proxy recovers on the next attempt', async () => {
  let loadCount = 0;
  const proxy = createLazyFeatureProxy({
    loadFeature: async () => {
      loadCount += 1;
      if (loadCount === 1) throw new Error('chunk load failed');
      return { ping: () => 'pong' };
    },
  });

  await assert.rejects(proxy.getFeature(), /chunk load failed/);
  assert.equal(proxy.isLoaded(), false, 'isLoaded must stay false after a failed load');

  const feature = await proxy.getFeature();
  assert.equal(feature.ping(), 'pong');
  assert.equal(proxy.isLoaded(), true, 'isLoaded must recover on the next successful load');
});
