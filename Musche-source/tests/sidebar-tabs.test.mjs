import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ref } from 'vue';

import {
  SIDEBAR_TABS,
  DEFAULT_SIDEBAR_TAB,
  isSidebarTab,
  nextSidebarTab,
  pickSidebarTab,
} from '../app/scripts/utils/sidebar-tabs.js';
import { registerSidebarNavigationFeature } from '../app/scripts/features/sidebar-navigation.js';
import { registerMainViewNavigationFeature } from '../app/scripts/features/main-view-navigation.js';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appSidebarComponent = readFileSync(resolve(rootDir, 'app/scripts/components/app-sidebar.js'), 'utf8');

// 模板里被注释掉的分类按钮（如已下线的 INST）不算「可用入口」
const activeSidebarMarkup = appSidebarComponent.replace(/<!--[\s\S]*?-->/g, '');

const createSwipeFeature = (startTab) => {
  const refs = {
    isMobile: ref(true),
    isSidebarOpen: ref(true),
    sidebarTab: ref(startTab),
  };
  const feature = registerSidebarNavigationFeature({ refs, actions: { setTimeoutFn: (cb) => cb() } });
  const swipe = (deltaX) => {
    feature.onSidebarTouchStart({ touches: [{ clientX: 200, clientY: 100 }] });
    feature.onSidebarTouchEnd({ changedTouches: [{ clientX: 200 + deltaX, clientY: 105 }] });
  };
  return { refs, feature, swipe };
};

test('分类真源只剩录音（musician）和编辑（project）', () => {
  assert.deepEqual(SIDEBAR_TABS, ['musician', 'project']);
  assert.equal(DEFAULT_SIDEBAR_TAB, 'musician');
  assert.equal(isSidebarTab('instrument'), false);
});

test('侧栏模板里没有已下线分类的入口，且现存按钮都在真源里', () => {
  const wiredTabs = [...activeSidebarMarkup.matchAll(/switchSidebarTab\('([a-z]+)'\)/g)].map((m) => m[1]);

  assert.ok(wiredTabs.length > 0, '侧栏应该至少有一个分类切换按钮');
  assert.deepEqual([...new Set(wiredTabs)].sort(), [...SIDEBAR_TABS].sort());
});

test('手机端左右滑动只在录音/编辑之间切，滑不到乐器', () => {
  const forward = createSwipeFeature('project');
  forward.swipe(-120); // 左滑 = 下一个分类
  assert.equal(forward.refs.sidebarTab.value, 'project', '编辑已经是最后一个分类，左滑不应再往后翻');

  const back = createSwipeFeature('project');
  back.swipe(120); // 右滑 = 上一个分类
  assert.equal(back.refs.sidebarTab.value, 'musician');

  const first = createSwipeFeature('musician');
  first.swipe(-120);
  assert.equal(first.refs.sidebarTab.value, 'project');
  first.swipe(-120);
  assert.equal(first.refs.sidebarTab.value, 'project', '连续左滑也不会滑出真源之外');
});

test('ghost 任务跳转不会跳进已下线的乐器分类', () => {
  const refs = {
    currentView: ref('month'),
    monthViewMode: ref('scrolled'),
    viewDate: ref(new Date(2026, 7, 14)),
    dayColWidth: ref(52),
    isMobile: ref(false),
    isResizingMobile: ref(false),
    currentSessionId: ref('S1'),
    sidebarTab: ref('musician'),
    flashingTaskId: ref(null),
    isContextSwitching: ref(false),
  };
  const feature = registerMainViewNavigationFeature({
    refs,
    actions: { setTimeoutFn: () => 0 },
  });

  feature.jumpToGhostContext({ scheduleId: 'S-1', sessionId: 'S1', instrumentId: 'I1' });
  assert.equal(refs.sidebarTab.value, 'musician', '只有乐器 id 的任务应回落到录音分类');

  feature.jumpToGhostContext({ scheduleId: 'S-2', sessionId: 'S1', projectId: 'P1', instrumentId: 'I1' });
  assert.equal(refs.sidebarTab.value, 'project', '带项目 id 的任务仍跳到编辑分类');
});

test('分类工具函数：循环切换与候选回落', () => {
  assert.equal(nextSidebarTab('musician'), 'project');
  assert.equal(nextSidebarTab('project'), 'musician');
  assert.equal(nextSidebarTab('instrument'), 'musician', '停在已下线分类时回到默认分类');

  assert.equal(pickSidebarTab(['instrument']), 'musician');
  assert.equal(pickSidebarTab(['project', 'instrument']), 'project');
  assert.equal(pickSidebarTab([]), 'musician');
});
