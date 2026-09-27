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

test('comparison renders both ratios with labels, margin, and time evidence', async () => {
  const html = await render();
  assert.match(html, /平均/);
  assert.match(html, /×20\.0/);
  assert.match(html, /安排/);
  assert.match(html, /×25\.0/);
  assert.match(html, /余量 \+25%/);
  assert.match(html, /历史录音 02:00:00 \/ 对应曲目 00:06:00/);
  assert.match(html, /本次安排 01:15:00 \/ 对应曲目 00:03:00/);
});

test('comparison communicates tight and equal schedules in text', async () => {
  const tight = await render({ scheduledRatio: 15, differencePercent: -25 });
  assert.match(tight, /偏紧 −25%/);
  const equal = await render({ scheduledRatio: 20, differencePercent: 0 });
  assert.match(equal, /与平均一致/);
  assert.doesNotMatch(equal, /余量 \+0%/);
});

test('missing average and schedule render dashes without default or difference badges', async () => {
  const html = await render({ averageRatio: null, scheduledRatio: null, differencePercent: null });
  assert.equal((html.match(/>—<\/span>/g) || []).length, 2);
  assert.doesNotMatch(html, /×20|余量|偏紧|与平均一致/);
  assert.match(html, /暂无有效录音记录/);
  assert.match(html, /尚未排期或缺少对应曲目时长/);
});
