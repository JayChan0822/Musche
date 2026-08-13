import assert from 'node:assert/strict';
import test from 'node:test';
import { ref } from 'vue';

import { registerUndoToastFeature } from '../app/scripts/features/undo-toast.js';
import { registerHistoryFeature } from '../app/scripts/features/history.js';

function createToast({ isMobile = true } = {}) {
  const undoCalls = [];
  const timers = [];
  const feature = registerUndoToastFeature({
    refs: { isMobile: ref(isMobile) },
    actions: {
      undo: () => undoCalls.push('undo'),
      setTimeoutFn: (callback) => { timers.push(callback); return timers.length; },
      clearTimeoutFn: (id) => { timers[id - 1] = null; },
    },
  });
  return { feature, undoCalls, runTimers: () => timers.forEach((cb) => cb && cb()) };
}

test('产生可撤销改动后浮出撤销条，超时自动收起', () => {
  const { feature, runTimers } = createToast();

  assert.equal(feature.undoToastVisible.value, false);
  feature.notifyHistoryPushed();
  assert.equal(feature.undoToastVisible.value, true);

  runTimers();
  assert.equal(feature.undoToastVisible.value, false);
});

test('点撤销：先收起再执行 undo', () => {
  const { feature, undoCalls } = createToast();

  feature.notifyHistoryPushed();
  feature.undoFromToast();

  assert.equal(feature.undoToastVisible.value, false);
  assert.deepEqual(undoCalls, ['undo']);
});

test('连续改动时重新计时，旧定时器不会提前收起', () => {
  const { feature, runTimers } = createToast();

  feature.notifyHistoryPushed();
  feature.notifyHistoryPushed();
  assert.equal(feature.undoToastVisible.value, true, '第二次改动后仍然可见');

  // 第一次的定时器已被取消，只剩最新那个会真正收起
  runTimers();
  assert.equal(feature.undoToastVisible.value, false);
});

test('桌面端不弹（有常驻按钮）', () => {
  const { feature } = createToast({ isMobile: false });

  feature.notifyHistoryPushed();
  assert.equal(feature.undoToastVisible.value, false);
});

test('history：真的入栈才通知，空改动不弹', () => {
  const notifications = [];
  const itemPool = ref([]);
  const scheduledTasks = ref([]);
  const history = ref([]);
  const historyIndex = ref(-1);
  const feature = registerHistoryFeature({
    refs: {
      itemPool,
      scheduledTasks,
      history,
      historyIndex,
      showTrackList: ref(false),
      trackListData: ref({}),
      currentSessionId: ref('S1'),
    },
    state: { settings: { startHour: 10 } },
    actions: {
      isItemVisibleForView: () => true,
      syncItemsForView: (list) => list,
      onHistoryPushed: () => notifications.push('pushed'),
    },
  });

  feature.pushHistory();
  assert.equal(notifications.length, 1, '首次快照入栈应通知');

  feature.pushHistory();
  assert.equal(notifications.length, 1, '内容没变的空快照被去重，不应再通知');

  scheduledTasks.value = [{ scheduleId: 'S-1' }];
  feature.pushHistory();
  assert.equal(notifications.length, 2, '真有改动时再次通知');
});
