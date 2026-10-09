import assert from 'node:assert/strict';
import test from 'node:test';
import { ref } from 'vue';

import { registerScheduleFeature } from '../app/scripts/features/schedule.js';
import { SIDEBAR_TABS } from '../app/scripts/utils/sidebar-tabs.js';

function createScheduleFeature({ sidebarTab = 'musician', currentSessionId = 'S1' } = {}) {
  const refs = {
    itemPool: ref([]),
    scheduledTasks: ref([]),
    currentSessionId: ref(currentSessionId),
    trackListData: ref({ schedules: [], items: [] }),
    showTrackList: ref(false),
    pxPerMin: ref(1),
    sidebarTab: ref(sidebarTab),
    currentView: ref('week'),
    viewDate: ref(new Date(2026, 7, 14)),
  };
  const feature = registerScheduleFeature({
    refs,
    state: { settings: { startHour: 10, endHour: 22 } },
    utils: {
      parseTime: () => 0,
      timeToMinutes: () => 0,
      getNameById: () => '',
      addDaysToDate: (date) => date,
      addMinutesToTime: (time) => time,
    },
    actions: { pushHistory: () => {} },
  });
  return { feature, refs };
}

test('任务在当前分类下缺 id 时算幽灵', () => {
  const { feature } = createScheduleFeature({ sidebarTab: 'musician' });

  assert.equal(feature.isTaskGhost({ sessionId: 'S1', musicianId: 'M1' }), false);
  assert.equal(feature.isTaskGhost({ sessionId: 'S1', projectId: 'P1' }), true, '录音分类下只有项目 id 的任务是幽灵');
});

test('别的 session 的任务始终是幽灵', () => {
  const { feature } = createScheduleFeature({ sidebarTab: 'musician', currentSessionId: 'S1' });

  assert.equal(feature.isTaskGhost({ sessionId: 'S2', musicianId: 'M1' }), true);
});

test('只剩已下线分类 id 的老任务不再是永久幽灵', () => {
  // 乐器分类下线后，只有 instrumentId 的历史任务在录音/编辑下都判幽灵的话，
  // 它会永远灰着、点了也跳不到能显示它的分类——所以按正常任务处理。
  assert.equal(SIDEBAR_TABS.includes('instrument'), false, '前提：乐器分类已下线');

  for (const tab of SIDEBAR_TABS) {
    const { feature } = createScheduleFeature({ sidebarTab: tab });
    assert.equal(
      feature.isTaskGhost({ sessionId: 'S1', instrumentId: 'I1' }),
      false,
      `${tab} 分类下，只有乐器 id 的任务不应是幽灵`,
    );
  }
});

test('跨 session 优先级高于分类回落', () => {
  const { feature } = createScheduleFeature({ sidebarTab: 'musician', currentSessionId: 'S1' });

  assert.equal(feature.isTaskGhost({ sessionId: 'S2', instrumentId: 'I1' }), true);
});
