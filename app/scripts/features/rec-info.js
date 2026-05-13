import { computed, reactive, ref } from 'vue';

export function registerRecInfoFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    sidebarTab,
    trackListData,
    scheduledTasks,
  } = refs;
  const { settings } = state;
  const {
    generateUniqueId,
  } = utils;
  const {
    pushHistory,
    triggerTouchHaptic,
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
    let list = [];

    if (type === 'studio') list = settings.studios;
    else if (type === 'engineer') list = settings.engineers;
    else if (type === 'operator') list = settings.operators;
    else if (type === 'assistant') list = settings.assistants;

    if (!list) return [];

    return list
      .filter((item) => item.name.toLowerCase().includes(search))
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
  });

  const openRecInfoModal = () => {
    const task = trackListData.value.taskRef;
    if (!task) return;

    const isEditMode = sidebarTab.value === 'project';
    const info = isEditMode ? (task.editInfo || {}) : (task.recordingInfo || {});

    recInfoForm.studio = info.studio || '';
    recInfoForm.engineer = info.engineer || '';
    recInfoForm.operator = info.operator || '';
    recInfoForm.assistant = info.assistant || '';
    recInfoForm.notes = info.notes || '';

    showRecInfoModal.value = true;
  };

  const saveRecInfo = () => {
    const task = trackListData.value.taskRef;
    if (!task) return;

    const isEditMode = sidebarTab.value === 'project';
    const newData = {
      studio: recInfoForm.studio.trim(),
      engineer: recInfoForm.engineer.trim(),
      operator: recInfoForm.operator.trim(),
      assistant: recInfoForm.assistant.trim(),
      notes: recInfoForm.notes.trim(),
    };

    if (isEditMode) {
      task.editInfo = newData;
    } else {
      task.recordingInfo = newData;
    }

    const idx = scheduledTasks.value.findIndex((item) => item.scheduleId === task.scheduleId);
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

    let list = null;
    if (type === 'studio') list = settings.studios;
    else if (type === 'engineer') list = settings.engineers;
    else if (type === 'operator') list = settings.operators;
    else if (type === 'assistant') list = settings.assistants;

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
    let val = recInfoForm[type];
    if (!val || !val.trim()) {
      val = prompt(`Enter new ${type} name:`);
    }

    if (val && val.trim()) {
      const cleanVal = val.trim();
      const listKey = `${type}s`;
      const exists = settings[listKey].some((item) => item.name === cleanVal);

      if (!exists) {
        settings[listKey].push({
          id: Date.now(),
          name: cleanVal,
        });
        triggerTouchHaptic('Success');
      }
    }
  };

  const removeRecItem = (type, id) => {
    let list = null;
    if (type === 'studio') list = settings.studios;
    else if (type === 'engineer') list = settings.engineers;
    else if (type === 'operator') list = settings.operators;
    else if (type === 'assistant') list = settings.assistants;

    if (list) {
      const idx = list.findIndex((item) => item.id === id);
      if (idx !== -1) {
        list.splice(idx, 1);
        pushHistory();
        triggerTouchHaptic('Medium');
      }
    }
  };

  const hasRecordingInfo = (task) => {
    const checkInfo = (info) => {
      if (!info) return false;
      return !!(
        (info.studio && info.studio.trim()) ||
        (info.engineer && info.engineer.trim()) ||
        (info.operator && info.operator.trim()) ||
        (info.assistant && info.assistant.trim()) ||
        (info.notes && info.notes.trim())
      );
    };

    return checkInfo(task.recordingInfo) || checkInfo(task.editInfo);
  };

  return {
    showRecInfoModal,
    recInfoForm,
    openRecInfoModal,
    saveRecInfo,
    activeRecDropdown,
    recDropdownSearch,
    filteredRecOptions,
    selectRecOption,
    createRecOption,
    newRecInputs,
    addRecItem,
    removeRecItem,
    hasRecordingInfo,
  };
}
