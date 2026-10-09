import assert from 'node:assert/strict';
import test from 'node:test';
import { registerMobileTouchEndFeature } from '../app/scripts/features/mobile-touch-end.js';

for (const [metaKey, expected] of [[false, '10:15'], [true, '10:13']]) {
  test(`touch block move uses ${metaKey ? 'one' : 'fifteen'} minute snapping`, () => {
    const task = { scheduleId: 'B', musicianId: 'M', startTime: '10:00', date: '2026-09-27', estDuration: '01:00:00' };
    const state = { dragSourceTask: task, dragSourceType: 'schedule', dragElClone: {}, dragClickOffsetY: 26 };
    const column = { dataset: { dateStr: '2026-09-28' }, querySelector: () => ({ getBoundingClientRect: () => ({ top: 100 }) }) };
    let saves = 0;
    const feature = registerMobileTouchEndFeature({
      refs: { scheduledTasks: { value: [task] }, pxPerMin: { value: 2 }, sidebarTab: { value: 'musician' }, currentSessionId: { value: 'S_DEFAULT' } },
      state, data: { settings: { startHour: 9, endHour: 18 } },
      actions: { getDocumentBody: () => ({ removeChild() {} }),
        elementFromPoint: () => ({ closest: (selector) => selector === '[data-date-str]' ? column : null }),
        pushHistory: () => saves++,
      },
    });
    feature.handleTouchEnd({ metaKey, changedTouches: [{ clientX: 50, clientY: 100 + (73 + 13) * 2 }] });
    assert.equal(task.startTime, expected);
    assert.equal(task.estDuration, '01:00:00');
    assert.equal(task.date, '2026-09-28');
    assert.equal(saves, 1);
  });
}
