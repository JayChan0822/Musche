import assert from 'node:assert/strict';
import test from 'node:test';
import { reactive, ref } from 'vue';
import { registerRecInfoFeature } from '../app/scripts/features/rec-info.js';
import { registerCreditsFeature } from '../app/scripts/features/credits.js';
import { AppMetadataLibrary } from '../app/scripts/components/app-metadata-library.js';

function harness() {
  let history = 0;
  let id = 0;
  const settings = reactive({ studios: [], engineers: [], operators: [], assistants: [] });
  const newRecInputs = reactive({ studio: '', engineer: '', operator: '', assistant: '' });
  const recInfoForm = reactive({ studio: 'Unrelated form', engineer: '', operator: '', assistant: '' });
  const refs = { recInfoForm, newRecInputs, itemPool: ref([]), scheduledTasks: ref([]), sidebarTab: ref('musician'), trackListData: ref({}) };
  const feature = registerRecInfoFeature({ refs, state: { settings }, utils: { generateUniqueId: () => `META_${++id}` },
    actions: { pushHistory: () => history++, promptForValue: () => assert.fail('inline creation must not prompt') },
  });
  const props = reactive({ ctx: { settings, newRecInputs, ...feature }, search: '' });
  return { settings, refs, props, library: AppMetadataLibrary.setup(props), feature, history: () => history };
}

for (const type of ['studio', 'engineer', 'operator', 'assistant']) {
  test(`metadata library adds ${type} from inline input, with history and duplicate protection`, async () => {
    const h = harness();
    h.refs.newRecInputs[type] = '  Studio A  ';
    await h.library.add(type);
    assert.equal(h.settings[`${type}s`][0].name, 'Studio A');
    assert.equal(h.refs.newRecInputs[type], '');
    assert.equal(h.refs.recInfoForm.studio, 'Unrelated form');
    assert.equal(h.history(), 1);
    h.refs.newRecInputs[type] = 'studio a';
    await h.library.add(type);
    assert.equal(h.settings[`${type}s`].length, 1);
    assert.equal(h.history(), 1);
    h.refs.newRecInputs[type] = 'Second';
    await h.library.add(type);
    assert.notEqual(h.settings[`${type}s`][0].id, h.settings[`${type}s`][1].id);
  });
}

test('metadata searches names or category and temporarily opens collapsed groups', () => {
  const h = harness();
  h.settings.studios.push({ id: 1, name: 'Abbey' });
  h.settings.engineers.push({ id: 2, name: 'Engineer' });
  assert.equal(h.library.isExpanded('studio'), false);
  h.props.search = 'ABBEY';
  assert.deepEqual(h.library.groups.value.map((g) => g.type), ['studio']);
  assert.equal(h.library.isExpanded('studio'), true);
  h.props.search = '工程师';
  assert.deepEqual(h.library.groups.value.map((g) => g.type), ['engineer']);
  h.props.search = '';
  assert.equal(h.library.isExpanded('studio'), false);
});

test('metadata rename and removal use the existing shared data and recording references', () => {
  const h = harness();
  const entry = { id: 'S', name: 'Old' };
  h.settings.studios.push(entry);
  h.refs.itemPool.value.push({ recordingInfo: { studio: 'Other / Old' } });
  h.refs.scheduledTasks.value.push({ editInfo: { studio: 'old / Another' } });
  h.feature.handleRecRename('studio', h.settings.studios[0], { target: { value: 'New' } });
  assert.equal(h.settings.studios[0].name, 'New');
  assert.equal(h.refs.itemPool.value[0].recordingInfo.studio, 'Other / New');
  assert.equal(h.refs.scheduledTasks.value[0].editInfo.studio, 'New / Another');
  h.feature.removeRecItem('studio', 'S');
  assert.equal(h.settings.studios.length, 0);
  assert.equal(h.history(), 2);
});

test('Credits include recording roles from a scheduled task without a player roster', () => {
  const generatedCreditText = ref('');
  const feature = registerCreditsFeature({
    refs: {
      itemPool: ref([]), currentSessionId: ref('S_DEFAULT'), showCreditModal: ref(false), generatedCreditText,
      scheduledTasks: ref([{ projectId: 'P', recordingInfo: {
        studio: 'Old Studio', engineer: 'Engineer A / Engineer B', operator: 'Operator A，Operator B',
        assistant: 'Assistant A\nAssistant B',
      } }]),
    },
    state: { settings: { projects: [{ id: 'P', name: 'Film' }] } },
    utils: { getNameById: () => 'Film' },
    actions: { openAlertModal: () => assert.fail('the schedule has recording details') },
  });
  feature.openCreditModal();
  assert.match(generatedCreditText.value, /Recording Studio：Old Studio\n/);
  assert.match(generatedCreditText.value, /Recording Engineer：Engineer A \/ Engineer B\n/);
  assert.match(generatedCreditText.value, /Recording Operator：Operator A \/ Operator B\n/);
  assert.match(generatedCreditText.value, /Recording Assistant：Assistant A \/ Assistant B\n/);
});
