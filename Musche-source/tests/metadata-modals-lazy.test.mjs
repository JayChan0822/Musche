import assert from 'node:assert/strict';
import test from 'node:test';

import { computed, reactive, ref } from 'vue';

import { registerMetadataModalsFeature } from '../app/scripts/features/metadata-modals.js';

function createContext(overrides = {}) {
  return {
    refs: {
      trackListData: ref({ taskRef: null }),
      sidebarTab: ref('musician'),
      itemPool: ref([]),
      scheduledTasks: ref([]),
      currentSessionId: ref('S_DEFAULT'),
      showCreditModal: ref(false),
      generatedCreditText: ref(''),
      showProjectInfoModal: ref(false),
    },
    state: {
      settings: reactive({
        projects: [{ id: 'P1', name: 'Project One' }],
        studios: [],
        engineers: [],
        operators: [],
        assistants: [],
      }),
    },
    utils: {
      generateUniqueId: () => 'REC1',
      getNameById: () => 'Name',
    },
    actions: {
      pushHistory: () => {},
      triggerTouchHaptic: () => {},
      openConfirmModal: () => {},
      openAlertModal: () => {},
      ...overrides,
    },
  };
}

test('metadata-modals lazy-loads child modal features only when their flows are used', async () => {
  const calls = [];
  const context = createContext({
    loadCreditsFeature: async () => {
      calls.push('credits-load');
      return () => ({
        openCreditModal: () => {
          calls.push('credits-open');
          context.refs.showCreditModal.value = true;
          context.refs.generatedCreditText.value = 'credits';
        },
        copyCreditText: () => calls.push('credits-copy'),
      });
    },
    loadProjectInfoFeature: async () => {
      calls.push('project-load');
      return ({ refs }) => ({
        projectInfoForm: refs.projectInfoForm,
        openProjectInfoModal: (project) => {
          calls.push(['project-open', project.id]);
          refs.projectInfoForm.id = project.id;
          refs.projectInfoForm.title = project.name;
          refs.showProjectInfoModal.value = true;
        },
        saveProjectInfo: () => calls.push('project-save'),
      });
    },
    loadRecInfoFeature: async () => {
      calls.push('rec-load');
      return ({ refs }) => ({
        showRecInfoModal: refs.showRecInfoModal,
        recInfoForm: refs.recInfoForm,
        activeRecDropdown: refs.activeRecDropdown,
        recDropdownSearch: refs.recDropdownSearch,
        filteredRecOptions: computed(() => [{ id: 'studio-1', name: 'Studio A' }]),
        newRecInputs: refs.newRecInputs,
        openRecInfoModal: () => {
          calls.push('rec-open');
          refs.recInfoForm.studio = 'Studio A';
          refs.showRecInfoModal.value = true;
        },
        saveRecInfo: () => calls.push('rec-save'),
        selectRecOption: () => {},
        createRecOption: () => {},
        addRecItem: () => {},
        removeRecItem: () => {},
        handleRecRename: () => {},
      });
    },
  });

  const feature = registerMetadataModalsFeature(context);

  assert.deepEqual(calls, [], 'registering metadata-modals must not load child modal feature modules');
  assert.equal(feature.showRecInfoModal.value, false);
  assert.deepEqual(feature.filteredRecOptions.value, []);
  assert.equal(feature.projectInfoForm.title, '');

  await feature.openCreditModal();

  assert.deepEqual(calls, ['credits-load', 'credits-open']);
  assert.equal(context.refs.showCreditModal.value, true);
  assert.equal(context.refs.generatedCreditText.value, 'credits');

  await feature.openProjectInfoModal(context.state.settings.projects[0]);

  assert.deepEqual(calls, ['credits-load', 'credits-open', 'project-load', ['project-open', 'P1']]);
  assert.equal(context.refs.showProjectInfoModal.value, true);
  assert.equal(feature.projectInfoForm.title, 'Project One');

  await feature.openRecInfoModal();

  assert.deepEqual(calls, ['credits-load', 'credits-open', 'project-load', ['project-open', 'P1'], 'rec-load', 'rec-open']);
  assert.equal(feature.showRecInfoModal.value, true);
  assert.equal(feature.recInfoForm.studio, 'Studio A');
  assert.deepEqual(feature.filteredRecOptions.value, [{ id: 'studio-1', name: 'Studio A' }]);

  await feature.copyCreditText();
  await feature.saveProjectInfo();
  await feature.saveRecInfo();

  assert.deepEqual(
    calls,
    ['credits-load', 'credits-open', 'project-load', ['project-open', 'P1'], 'rec-load', 'rec-open', 'credits-copy', 'project-save', 'rec-save'],
    'loaded metadata child features should be cached and reused',
  );
});
