import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { ref } from 'vue';

import { registerMainViewNavigationFeature } from '../app/scripts/features/main-view-navigation.js';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const componentsCss = readFileSync(resolve(rootDir, 'app/styles/components.css'), 'utf8');

const getRuleBody = (selector) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return componentsCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))?.[1] || '';
};

test('week and month views use reciprocal vertical transition names', () => {
  const currentView = ref('week');
  const feature = registerMainViewNavigationFeature({
    refs: {
      currentView,
      monthViewMode: ref('paged'),
      viewDate: ref(new Date('2026-07-18T00:00:00')),
    },
  });

  feature.switchView('month');
  assert.equal(feature.viewTransitionName.value, 'view-slide-up');

  feature.switchView('week');
  assert.equal(feature.viewTransitionName.value, 'view-slide-down');
});

test('view transition endpoints move only on the vertical axis', () => {
  const expectedTransforms = new Map([
    ['.view-slide-up-enter-from', 'translate3d(0, 30px, 0)'],
    ['.view-slide-up-leave-to', 'translate3d(0, -30px, 0)'],
    ['.view-slide-down-enter-from', 'translate3d(0, -30px, 0)'],
    ['.view-slide-down-leave-to', 'translate3d(0, 30px, 0)'],
  ]);

  for (const [selector, transform] of expectedTransforms) {
    const ruleBody = getRuleBody(selector);
    assert.ok(ruleBody, `${selector} should be defined`);
    assert.match(ruleBody, new RegExp(`transform:\\s*${transform.replace(/[()]/g, '\\$&')}`));
    assert.doesNotMatch(ruleBody, /scale|translateX/, `${selector} should not scale or move horizontally`);
  }
});
