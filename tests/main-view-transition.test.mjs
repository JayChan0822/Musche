import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { nextTick, ref } from 'vue';

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
      isMobile: ref(false),
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

// —— 手机端阉割掉周视图：没有入口，也不许任何路径切过去 ——
function createMobileNav({ isMobile = true, currentView = 'month' } = {}) {
  const refs = {
    currentView: ref(currentView),
    monthViewMode: ref('paged'),
    viewDate: ref(new Date(2026, 7, 14)),
    dayColWidth: ref(52),
    isMobile: ref(isMobile),
    isResizingMobile: ref(false),
    currentSessionId: ref('S1'),
    sidebarTab: ref('musician'),
    flashingTaskId: ref(null),
    isContextSwitching: ref(false),
  };
  const feature = registerMainViewNavigationFeature({ refs, actions: { setTimeoutFn: () => 0 } });
  return { feature, refs };
}

test('手机端 switchView 拒绝切到周视图，月视图照常', () => {
  const { feature, refs } = createMobileNav();

  feature.switchView('week');
  assert.equal(refs.currentView.value, 'month', '手机端不该进周视图');

  refs.currentView.value = 'week';
  feature.switchView('month');
  assert.equal(refs.currentView.value, 'month', '切回月视图不受影响');
});

test('桌面端缩到手机宽度时，停在周视图会被拉回月视图', async () => {
  const { refs } = createMobileNav({ isMobile: false, currentView: 'week' });

  refs.isMobile.value = true;
  await nextTick();

  assert.equal(refs.currentView.value, 'month');
});
