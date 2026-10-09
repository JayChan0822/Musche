import assert from 'node:assert/strict';
import test from 'node:test';
import { createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { AppRatioComparison } from '../app/scripts/components/app-ratio-comparison.js';

const render = (overrides = {}) => renderToString(createSSRApp(AppRatioComparison, { comparison: {
  averageRatio: 20, scheduledRatio: 25, differencePercent: 25,
  actualSeconds: 7200, recordedMusicSeconds: 360, blockSeconds: 4500, scheduledMusicSeconds: 180,
  ...overrides,
} }));

test('ratio button is collapsed and shows scheduled ratio only', async () => {
  const html = await render();
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /×25\.0/);
  assert.doesNotMatch(html, /×20\.0/);
  assert.match(html, /bg-teal-400/);
});

test('tight schedules use an orange indicator', async () => {
  const html = await render({ scheduledRatio: 15, differencePercent: -25 });
  assert.match(html, /bg-orange-400/);
  assert.match(html, /×15\.0/);
});

test('missing data has a neutral indicator and no invented default', async () => {
  const html = await render({ averageRatio: null, scheduledRatio: null, differencePercent: null });
  assert.match(html, /×—/);
  assert.match(html, /bg-gray-400/);
  assert.doesNotMatch(html, /×20/);
});
