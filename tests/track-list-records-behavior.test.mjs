import assert from 'node:assert/strict';
import test from 'node:test';

import { createTrackListRecords } from '../app/scripts/features/track-list-records.js';

const ref = (value) => ({ value });

function createRecords(overrides = {}) {
  const calls = { efficiency: [], history: 0, resize: 0 };
  const deps = {
    trackListData: ref({ viewType: 'musician', schedules: [], items: [], taskRef: {} }),
    itemPool: ref([]),
    scheduledTasks: ref([]),
    showTrackList: ref(false),
    formatSecs: (secs) => `${secs}s`,
    openInputModal: () => {},
    openAlertModal: () => {},
    pushHistory: () => { calls.history += 1; },
    autoUpdateEfficiency: (...args) => calls.efficiency.push(args),
    checkCanDeleteSplit: () => true,
    restoreSplitTime: () => false,
    pruneEmptySchedules: () => {},
    getViewType: () => 'musician',
    getTargetId: (item) => item.musicianId,
    autoResizeScheduleByRecords: () => { calls.resize += 1; },
    ...overrides,
  };
  const records = createTrackListRecords(deps);
  return { records, calls, deps };
}

test('saveTrackRecord debounces the efficiency write-back and pushes history on fire', () => {
  test.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { records, calls } = createRecords();
    const item = { id: 'T1', musicianId: 'M1', sessionId: 'S1' };

    records.saveTrackRecord(item);
    records.saveTrackRecord(item); // 去抖：重置 1500ms，只应触发一次
    assert.equal(calls.efficiency.length, 0, 'write-back must not run before the debounce fires');
    assert.equal(calls.history, 0, 'no history before the debounce fires');

    test.mock.timers.tick(1500);

    assert.deepEqual(calls.efficiency, [['M1', 'musician']], 'write-back runs exactly once after the debounce window');
    assert.equal(calls.history, 1, 'debounced write-back must enter the undo stack (93e045f regression guard)');
  } finally {
    test.mock.timers.reset();
  }
});

test('cancelPendingTrackSave drops a pending write-back so it never fires', () => {
  test.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { records, calls } = createRecords();
    const item = { id: 'T1', musicianId: 'M1', sessionId: 'S1' };

    records.saveTrackRecord(item);
    records.cancelPendingTrackSave();

    test.mock.timers.tick(1500);

    assert.equal(calls.efficiency.length, 0, 'cancelled write-back must not fire');
    assert.equal(calls.history, 0, 'cancelled write-back must not push history');
  } finally {
    test.mock.timers.reset();
  }
});

test('calcTrackDiff computes actualDuration and schedules the debounced write-back', () => {
  test.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const { records, calls } = createRecords();
    const item = {
      id: 'T1',
      musicianId: 'M1',
      sessionId: 'S1',
      records: { musician: { recStart: '09:00', recEnd: '09:05', breakMinutes: 1 } },
    };

    records.calcTrackDiff(item);

    // 09:00→09:05 = 5 分钟，扣 1 分钟休息 = 4 分钟 = 240s
    assert.equal(item.records.musician.actualDuration, '240s', 'actualDuration should be recEnd - recStart - break');
    assert.equal(calls.resize, 1, 'recorded start and end update the associated schedule');
    assert.equal(calls.efficiency.length, 0, 'efficiency write-back is debounced, not synchronous');

    test.mock.timers.tick(1500);
    assert.deepEqual(calls.efficiency, [['M1', 'musician']], 'calcTrackDiff path also lands in the undo stack via debounce');
    assert.equal(calls.history, 1, 'history should be pushed once for the debounced write-back');
  } finally {
    test.mock.timers.reset();
  }
});

test('clearing actual recording time preserves booked schedule duration', () => {
  const { records, calls } = createRecords();
  const item = {musicianId:'M1',records:{musician:{actualDuration:'01:00:00',recStart:'10:00',recEnd:'11:00'}}};
  records.clearTrackTime(item);
  assert.equal(item.records.musician.actualDuration,'');
  assert.equal(calls.resize,0);
});

test('debounced actual save keeps original stage after user switches view', () => {
  test.mock.timers.enable({apis:['setTimeout']});
  try {
    let view = 'musician';
    const { records, calls } = createRecords({getViewType:()=>view,getTargetId:(item, type)=>type === 'project' ? item.editorId : item.musicianId});
    records.saveTrackRecord({musicianId:'M',editorId:'E'});
    view='project';
    test.mock.timers.tick(1500);
    assert.deepEqual(calls.efficiency,[['M','musician']]);
  } finally { test.mock.timers.reset(); }
});

test('EDIT section adjustment never moves REC block for the same template', () => {
  const rec={templateId:'T',stage:'rec',date:'2026-09-27',startTime:'10:00'};
  const edit={templateId:'T',stage:'edit',date:'2026-09-27',startTime:'11:00'};
  const target={stage:'edit',date:'2026-09-28',startTime:'12:00'};
  const { records } = createRecords({getViewType:()=> 'project',scheduledTasks:ref([rec,edit]),trackListData:ref({schedules:[target]})});
  records.syncTrackItemScheduleSection({id:'T',sectionIndex:0});
  assert.equal(rec.date,'2026-09-27'); assert.equal(rec.startTime,'10:00');
  assert.equal(edit.date,'2026-09-28'); assert.equal(edit.startTime,'12:00');
});

test('actual save captures execution owner and date once and preserves it after reassignment', () => {
  test.mock.timers.enable({apis:['setTimeout']});
  try {
    const { records }=createRecords({getViewType:()=> 'project',trackListData:ref({schedules:[{stage:'edit',date:'2026-09-28'}]})});
    const item={editorId:'E1',records:{project:{recStart:'10:00'}}};
    records.saveTrackRecord(item);
    assert.equal(item.records.project.assigneeId,'E1');
    assert.equal(item.records.project.date,'2026-09-28');
    item.editorId='E2';
    records.saveTrackRecord(item);
    assert.equal(item.records.project.assigneeId,'E1');
    records.cancelPendingTrackSave();
  } finally { test.mock.timers.reset(); }
});

test('empty actual data or missing assignee never invents historical ownership', () => {
  const {records}=createRecords();
  const item={musicianId:'M',records:{musician:{}}};
  records.calcTrackDiff(item);
  assert.equal(item.records.musician.assigneeId,undefined);
  delete item.musicianId;
  item.records.musician.recStart='10:00';
  records.calcTrackDiff(item);
  assert.equal(item.records.musician.assigneeId,'');
  assert.equal(item.records.musician.date,undefined);
});

test('recording times immediately updates the linked schedule through layout', () => {
  const { records, calls } = createRecords();
  records.calcTrackDiff({ records: { musician: { recStart: '10:03', recEnd: '10:17' } } });
  records.cancelPendingTrackSave();
  assert.equal(calls.resize, 1);
});
