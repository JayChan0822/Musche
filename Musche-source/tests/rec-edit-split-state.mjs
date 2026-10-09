import assert from 'node:assert/strict';

import {
  getConnectedSplitItemIds,
  rebalanceSplitFamilyDuration,
  syncFamilyTotalDuration,
  ensureItemSplitViews,
  getItemSplitState,
  isItemVisibleInView,
  peekItemSplitState,
  peekItemVisibilityInView,
  setItemSplitState,
  syncVisibleSplitDuration,
} from '../app/scripts/utils/split-state.js';

const legacyTask = {
  id: 'T1',
  musicDuration: '03:20',
  estDuration: '01:07',
  splitTag: 'Part 1',
  splitFromId: 'ROOT',
  sectionIndex: 2,
};

ensureItemSplitViews(legacyTask);

assert.deepEqual(
  getItemSplitState(legacyTask, 'musician'),
  {
    active: true,
    splitFromId: 'ROOT',
    splitTag: 'Part 1',
    musicDuration: '03:20',
    estDuration: '01:07',
    sectionIndex: 2,
  },
  'legacy data should seed REC split state'
);

assert.deepEqual(
  getItemSplitState(legacyTask, 'project'),
  {
    active: true,
    splitFromId: 'ROOT',
    splitTag: 'Part 1',
    musicDuration: '03:20',
    estDuration: '01:07',
    sectionIndex: 2,
  },
  'legacy data should seed EDIT split state'
);

const independentTask = {
  id: 'T2',
  musicDuration: '04:00',
  estDuration: '01:20',
};

ensureItemSplitViews(independentTask);

setItemSplitState(independentTask, 'musician', {
  splitTag: 'Part 1',
  musicDuration: '02:00',
  estDuration: '00:40',
  sectionIndex: 1,
});

assert.equal(
  getItemSplitState(independentTask, 'musician').musicDuration,
  '02:00',
  'REC view should store its own visible duration'
);
assert.equal(
  getItemSplitState(independentTask, 'project').musicDuration,
  '04:00',
  'EDIT view should keep the original duration when REC changes'
);

setItemSplitState(independentTask, 'project', {
  splitTag: 'Part 1',
  musicDuration: '01:30',
  estDuration: '00:30',
  sectionIndex: 3,
});

assert.equal(
  getItemSplitState(independentTask, 'project').musicDuration,
  '01:30',
  'EDIT view should store its own visible duration'
);
assert.equal(
  getItemSplitState(independentTask, 'musician').musicDuration,
  '02:00',
  'REC view should remain untouched when EDIT changes'
);

const recOnlyChild = {
  id: 'T3',
  musicDuration: '02:00',
  estDuration: '00:40',
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'T2',
      splitTag: 'Part 2',
      musicDuration: '02:00',
      estDuration: '00:40',
      sectionIndex: 2,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};

assert.equal(isItemVisibleInView(recOnlyChild, 'musician'), true, 'REC-only child should show in REC');
assert.equal(isItemVisibleInView(recOnlyChild, 'project'), false, 'REC-only child should stay hidden in EDIT');

const rawTask = {
  id: 'T4',
  musicDuration: '05:00',
  estDuration: '01:40',
};

const peeked = peekItemSplitState(rawTask, 'project');
assert.deepEqual(
  peeked,
  {
    active: true,
    splitFromId: null,
    splitTag: '',
    musicDuration: '05:00',
    estDuration: '01:40',
    sectionIndex: 0,
  },
  'peek API should read legacy-compatible split state without initialization'
);
assert.equal(rawTask.splitViews, undefined, 'peek API must not mutate source tasks');
assert.equal(peekItemVisibilityInView(rawTask, 'project'), true, 'peek visibility should be readable without mutations');

const familyRoot = {
  id: 'ROOT_A',
  musicDuration: '04:00',
  estDuration: '01:20',
};
const familyChild = {
  id: 'CHILD_A',
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'ROOT_A',
      splitTag: 'Part 2',
      musicDuration: '01:30',
      estDuration: '00:30',
      sectionIndex: 1,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};
const familyGrandChild = {
  id: 'GRAND_A',
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'CHILD_A',
      splitTag: 'Part 3',
      musicDuration: '00:45',
      estDuration: '00:15',
      sectionIndex: 2,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};

assert.deepEqual(
  [...getConnectedSplitItemIds([familyRoot, familyChild, familyGrandChild], 'CHILD_A')].sort(),
  ['CHILD_A', 'GRAND_A', 'ROOT_A'],
  'connected split family lookup should return the full split chain'
);

const durationTask = {
  id: 'SYNC_A',
  musicDuration: '03:30',
  estDuration: '01:10',
  splitViews: {
    musician: {
      active: true,
      splitFromId: null,
      splitTag: 'Part 1',
      musicDuration: '01:40',
      estDuration: '00:33',
      sectionIndex: 0,
    },
    project: {
      active: true,
      splitFromId: null,
      splitTag: '',
      musicDuration: '03:30',
      estDuration: '01:10',
      sectionIndex: 0,
    },
  },
};

syncVisibleSplitDuration(durationTask, '02:00', '00:40');
assert.equal(
  getItemSplitState(durationTask, 'musician').musicDuration,
  '02:00',
  'duration sync should update the edited REC-visible state'
);
assert.equal(
  getItemSplitState(durationTask, 'project').musicDuration,
  '02:00',
  'duration sync should update the other visible EDIT state'
);

const crossViewRoot = {
  id: 'ROOT_SYNC',
  ratio: 20,
  musicDuration: '03:30',
  estDuration: '01:10',
  splitViews: {
    musician: {
      active: true,
      splitFromId: null,
      splitTag: 'Part 1',
      musicDuration: '01:20',
      estDuration: '00:26',
      sectionIndex: 0,
    },
    project: {
      active: true,
      splitFromId: null,
      splitTag: '',
      musicDuration: '03:30',
      estDuration: '01:10',
      sectionIndex: 0,
    },
  },
};
const crossViewChild = {
  id: 'CHILD_SYNC',
  ratio: 20,
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'ROOT_SYNC',
      splitTag: 'Part 2',
      musicDuration: '02:10',
      estDuration: '00:43',
      sectionIndex: 1,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};

syncFamilyTotalDuration(
  [crossViewRoot, crossViewChild],
  'ROOT_SYNC',
  'musician',
  (item, musicDuration) => `${item.id}:${musicDuration}`
);

assert.equal(
  crossViewRoot.sharedMusicDuration,
  '03:30',
  'family duration sync should record the full visible total on the family'
);
assert.equal(
  getItemSplitState(crossViewRoot, 'project').musicDuration,
  '03:30',
  'unsplit opposite view should receive the synchronized total duration'
);
assert.equal(
  getItemSplitState(crossViewRoot, 'project').estDuration,
  'ROOT_SYNC:03:30',
  'unsplit opposite view should recalculate its estimate from the synchronized total'
);
assert.equal(
  getItemSplitState(crossViewRoot, 'musician').musicDuration,
  '01:20',
  'split source view should keep its manual part allocation'
);

syncFamilyTotalDuration(
  [crossViewRoot, crossViewChild],
  'ROOT_SYNC',
  'project',
  (item, musicDuration) => `${item.id}:${musicDuration}`
);

assert.equal(
  getItemSplitState(crossViewRoot, 'musician').musicDuration,
  '01:20',
  'split opposite view should not be auto-redistributed when an unsplit total changes'
);

const longRoot = {
  id: 'LONG_ROOT',
  ratio: 20,
  musicDuration: '00:30:00',
  estDuration: '10:00',
  splitViews: {
    musician: {
      active: true,
      splitFromId: null,
      splitTag: 'Part 1',
      musicDuration: '00:30:00',
      estDuration: '10:00',
      sectionIndex: 0,
    },
    project: {
      active: true,
      splitFromId: null,
      splitTag: '',
      musicDuration: '00:45:00',
      estDuration: '15:00',
      sectionIndex: 0,
    },
  },
};
const longChild = {
  id: 'LONG_CHILD',
  ratio: 20,
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'LONG_ROOT',
      splitTag: 'Part 2',
      musicDuration: '00:45:30',
      estDuration: '15:10',
      sectionIndex: 1,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};

syncFamilyTotalDuration(
  [longRoot, longChild],
  'LONG_ROOT',
  'musician',
  (item, musicDuration) => `${item.id}:${musicDuration}`
);

assert.equal(
  getItemSplitState(longRoot, 'project').musicDuration,
  '01:15:30',
  'family total sync should preserve HH:MM:SS when the combined duration exceeds an hour'
);

const lockedRoot = {
  id: 'LOCK_ROOT',
  ratio: 20,
  splitViews: {
    musician: {
      active: true,
      splitFromId: null,
      splitTag: 'Part 1',
      musicDuration: '01:00',
      estDuration: '00:20',
      sectionIndex: 0,
    },
    project: {
      active: true,
      splitFromId: null,
      splitTag: '',
      musicDuration: '03:30',
      estDuration: '01:10',
      sectionIndex: 0,
    },
  },
};
const lockedMiddle = {
  id: 'LOCK_MID',
  ratio: 20,
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'LOCK_ROOT',
      splitTag: 'Part 2',
      musicDuration: '01:00',
      estDuration: '00:20',
      sectionIndex: 1,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};
const lockedTail = {
  id: 'LOCK_TAIL',
  ratio: 20,
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'LOCK_MID',
      splitTag: 'Part 3',
      musicDuration: '01:30',
      estDuration: '00:30',
      sectionIndex: 2,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};

const rebalanceResult = rebalanceSplitFamilyDuration(
  [lockedRoot, lockedMiddle, lockedTail],
  'LOCK_ROOT',
  'musician',
  'LOCK_MID',
  '01:20',
  (item, musicDuration) => `${item.id}:${musicDuration}`
);

assert.equal(rebalanceResult.ok, true, 'split family rebalance should succeed when the edited part fits within the fixed total');
assert.equal(
  getItemSplitState(lockedMiddle, 'musician').musicDuration,
  '01:20',
  'edited part should keep the requested duration when the family total stays locked'
);
assert.equal(
  getItemSplitState(lockedTail, 'musician').musicDuration,
  '01:10',
  'the last visible part should absorb the remaining duration delta so the family total stays fixed'
);
assert.equal(
  getItemSplitState(lockedRoot, 'project').musicDuration,
  '03:30',
  'rebalancing split parts should not change the opposite unsplit total'
);

const blockedRoot = {
  id: 'BLOCK_ROOT',
  ratio: 20,
  splitViews: {
    musician: {
      active: true,
      splitFromId: null,
      splitTag: 'Part 1',
      musicDuration: '01:20',
      estDuration: '00:26',
      sectionIndex: 0,
    },
    project: {
      active: true,
      splitFromId: null,
      splitTag: '',
      musicDuration: '03:30',
      estDuration: '01:10',
      sectionIndex: 0,
    },
  },
};
const blockedTail = {
  id: 'BLOCK_TAIL',
  ratio: 20,
  splitViews: {
    musician: {
      active: true,
      splitFromId: 'BLOCK_ROOT',
      splitTag: 'Part 2',
      musicDuration: '02:10',
      estDuration: '00:43',
      sectionIndex: 1,
    },
    project: {
      active: false,
      splitFromId: null,
      splitTag: '',
      musicDuration: '',
      estDuration: '',
      sectionIndex: 0,
    },
  },
};

const blockedResult = rebalanceSplitFamilyDuration(
  [blockedRoot, blockedTail],
  'BLOCK_ROOT',
  'musician',
  'BLOCK_ROOT',
  '04:00',
  (item, musicDuration) => `${item.id}:${musicDuration}`
);

assert.deepEqual(
  blockedResult,
  {
    ok: false,
    reason: 'exceeds_total',
    totalMusicDuration: '03:30',
  },
  'split family rebalance should reject edits that exceed the locked total duration'
);
assert.equal(
  getItemSplitState(blockedRoot, 'musician').musicDuration,
  '01:20',
  'rejected edits must leave the original part duration untouched'
);
assert.equal(
  getItemSplitState(blockedTail, 'musician').musicDuration,
  '02:10',
  'rejected edits must not mutate the remaining parts'
);

console.log('rec/edit split-state regression passed');
