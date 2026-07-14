import { computed, reactive, ref, shallowRef } from 'vue';

export function registerMetadataModalsFeature(context) {
  const { refs, state, utils, actions } = context;
  const loadCreditsFeature = actions.loadCreditsFeature || (async () => {
    const module = await import('./credits.js');
    return module.registerCreditsFeature;
  });
  const loadProjectInfoFeature = actions.loadProjectInfoFeature || (async () => {
    const module = await import('./project-info.js');
    return module.registerProjectInfoFeature;
  });
  const loadRecInfoFeature = actions.loadRecInfoFeature || (async () => {
    const module = await import('./rec-info.js');
    return module.registerRecInfoFeature;
  });

  const creditsFeatureRef = shallowRef(null);
  const projectInfoFeatureRef = shallowRef(null);
  const recInfoFeatureRef = shallowRef(null);
  let creditsFeaturePromise = null;
  let projectInfoFeaturePromise = null;
  let recInfoFeaturePromise = null;

  const showRecInfoModal = refs.showRecInfoModal || ref(false);
  const recInfoForm = refs.recInfoForm || reactive({
    studio: '',
    engineer: '',
    operator: '',
    assistant: '',
    notes: '',
  });
  const activeRecDropdown = refs.activeRecDropdown || ref(null);
  const recDropdownSearch = refs.recDropdownSearch || ref('');
  const newRecInputs = refs.newRecInputs || reactive({
    studio: '',
    engineer: '',
    operator: '',
    assistant: '',
  });
  const projectInfoForm = refs.projectInfoForm || reactive({
    id: null,
    title: '',
    composer: '',
    arranger: '',
    producer: '',
    mixingEngineer: '',
    mixingStudio: '',
    masteringEngineer: '',
    masteringStudio: '',
    dolbyStudio: '',
    publishedBy: '',
    producedBy: '',
  });

  const getCreditsFeature = () => {
    if (!creditsFeaturePromise) {
      creditsFeaturePromise = loadCreditsFeature().then((registerCreditsFeature) => {
        const creditsFeature = registerCreditsFeature({
          refs: {
            itemPool: refs.itemPool,
            scheduledTasks: refs.scheduledTasks,
            currentSessionId: refs.currentSessionId,
            showCreditModal: refs.showCreditModal,
            generatedCreditText: refs.generatedCreditText,
          },
          state: {
            settings: state.settings,
          },
          utils: {
            getNameById: utils.getNameById,
          },
          actions: {
            openAlertModal: actions.openAlertModal,
          },
        });
        creditsFeatureRef.value = creditsFeature;
        return creditsFeature;
      });
    }
    return creditsFeaturePromise;
  };

  const getProjectInfoFeature = () => {
    if (!projectInfoFeaturePromise) {
      projectInfoFeaturePromise = loadProjectInfoFeature().then((registerProjectInfoFeature) => {
        const projectInfoFeature = registerProjectInfoFeature({
          refs: {
            showProjectInfoModal: refs.showProjectInfoModal,
            projectInfoForm,
          },
          state: {
            settings: state.settings,
          },
          actions: {
          },
        });
        projectInfoFeatureRef.value = projectInfoFeature;
        return projectInfoFeature;
      });
    }
    return projectInfoFeaturePromise;
  };

  const getRecInfoFeature = () => {
    if (!recInfoFeaturePromise) {
      recInfoFeaturePromise = loadRecInfoFeature().then((registerRecInfoFeature) => {
        const recInfoFeature = registerRecInfoFeature({
          refs: {
            trackListData: refs.trackListData,
            sidebarTab: refs.sidebarTab,
            itemPool: refs.itemPool,
            scheduledTasks: refs.scheduledTasks,
            showRecInfoModal,
            recInfoForm,
            activeRecDropdown,
            recDropdownSearch,
            newRecInputs,
          },
          state: {
            settings: state.settings,
          },
          utils: {
            generateUniqueId: utils.generateUniqueId,
          },
          actions: {
            pushHistory: actions.pushHistory,
            openConfirmModal: actions.openConfirmModal,
            openAlertModal: actions.openAlertModal,
          },
        });
        recInfoFeatureRef.value = recInfoFeature;
        return recInfoFeature;
      });
    }
    return recInfoFeaturePromise;
  };

  const callCredits = async (key, ...args) => (await getCreditsFeature())[key](...args);
  const callProjectInfo = async (key, ...args) => (await getProjectInfoFeature())[key](...args);
  const callRecInfo = async (key, ...args) => (await getRecInfoFeature())[key](...args);
  const filteredRecOptions = computed(() => recInfoFeatureRef.value?.filteredRecOptions.value || []);

  return {
    showRecInfoModal,
    recInfoForm,
    openRecInfoModal: (...args) => callRecInfo('openRecInfoModal', ...args),
    saveRecInfo: (...args) => callRecInfo('saveRecInfo', ...args),
    activeRecDropdown,
    recDropdownSearch,
    filteredRecOptions,
    selectRecOption: (...args) => callRecInfo('selectRecOption', ...args),
    createRecOption: (...args) => callRecInfo('createRecOption', ...args),
    newRecInputs,
    addRecItem: (...args) => callRecInfo('addRecItem', ...args),
    removeRecItem: (...args) => callRecInfo('removeRecItem', ...args),
    handleRecRename: (...args) => callRecInfo('handleRecRename', ...args),
    openCreditModal: (...args) => callCredits('openCreditModal', ...args),
    copyCreditText: (...args) => callCredits('copyCreditText', ...args),
    projectInfoForm,
    openProjectInfoModal: (...args) => callProjectInfo('openProjectInfoModal', ...args),
    saveProjectInfo: (...args) => callProjectInfo('saveProjectInfo', ...args),
  };
}
