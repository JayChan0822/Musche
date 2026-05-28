import { computed, reactive, ref } from 'vue';

const REC_INFO_FIELDS = ['studio', 'engineer', 'operator', 'assistant', 'notes'];

function getMetadataList(settings, type) {
  if (type === 'studio') return settings.studios;
  if (type === 'engineer') return settings.engineers;
  if (type === 'operator') return settings.operators;
  if (type === 'assistant') return settings.assistants;
  return null;
}

export function registerRecInfoFeature(context) {
  const { refs, state, utils, actions } = context;
  const { trackListData, sidebarTab, scheduledTasks } = refs;
  const { settings } = state;
  const { generateUniqueId } = utils;
  const {
    pushHistory,
    triggerTouchHaptic,
    promptForValue = (message) => prompt(message),
  } = actions;

  const showRecInfoModal = ref(false);
  const recInfoForm = reactive({
    studio: '',
    engineer: '',
    operator: '',
    assistant: '',
    notes: '',
  });
  const activeRecDropdown = ref(null);
  const recDropdownSearch = ref('');
  const newRecInputs = reactive({
    studio: '',
    engineer: '',
    operator: '',
    assistant: '',
  });

  const filteredRecOptions = computed(() => {
    const type = activeRecDropdown.value;
    const search = recDropdownSearch.value.toLowerCase().trim();
    const list = getMetadataList(settings, type);
    if (!list) return [];

    return list
      .filter((item) => item.name.toLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
  });

  const openRecInfoModal = () => {
    const task = trackListData.value.taskRef;
    if (!task) return;

    const info = sidebarTab.value === 'project'
      ? (task.editInfo || {})
      : (task.recordingInfo || {});

    REC_INFO_FIELDS.forEach((field) => {
      recInfoForm[field] = info[field] || '';
    });

    showRecInfoModal.value = true;
  };

  const saveRecInfo = () => {
    const task = trackListData.value.taskRef;
    if (!task) return;

    const newData = {};
    REC_INFO_FIELDS.forEach((field) => {
      newData[field] = recInfoForm[field].trim();
    });

    if (sidebarTab.value === 'project') {
      task.editInfo = newData;
    } else {
      task.recordingInfo = newData;
    }

    const idx = scheduledTasks.value.findIndex((scheduledTask) => scheduledTask.scheduleId === task.scheduleId);
    if (idx !== -1) {
      scheduledTasks.value[idx] = { ...task };
    }

    pushHistory();
    triggerTouchHaptic('Success');
    showRecInfoModal.value = false;
  };

  const selectRecOption = (item) => {
    if (activeRecDropdown.value) {
      recInfoForm[activeRecDropdown.value] = item.name;
    }

    activeRecDropdown.value = null;
    recDropdownSearch.value = '';
  };

  const createRecOption = () => {
    const name = recDropdownSearch.value.trim();
    const type = activeRecDropdown.value;
    if (!name || !type) return;

    const list = getMetadataList(settings, type);
    if (list) {
      const exists = list.some((item) => item.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        list.push({
          id: generateUniqueId('REC'),
          name,
        });
        pushHistory();
      }
    }

    recInfoForm[type] = name;
    activeRecDropdown.value = null;
    recDropdownSearch.value = '';
    triggerTouchHaptic('Success');
  };

  const addRecItem = (type) => {
    let value = recInfoForm[type];
    if (!value || !value.trim()) {
      value = promptForValue(`Enter new ${type} name:`);
    }

    if (!value || !value.trim()) return;

    const cleanValue = value.trim();
    const listKey = `${type}s`;
    const exists = settings[listKey].some((item) => item.name === cleanValue);

    if (!exists) {
      settings[listKey].push({
        id: Date.now(),
        name: cleanValue,
      });
      triggerTouchHaptic('Success');
    }
  };

  const removeRecItem = (type, id) => {
    const list = getMetadataList(settings, type);
    if (!list) return;

    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return;

    list.splice(idx, 1);
    pushHistory();
    triggerTouchHaptic('Medium');
  };

  return {
    showRecInfoModal,
    recInfoForm,
    activeRecDropdown,
    recDropdownSearch,
    filteredRecOptions,
    newRecInputs,
    openRecInfoModal,
    saveRecInfo,
    selectRecOption,
    createRecOption,
    addRecItem,
    removeRecItem,
  };
}
