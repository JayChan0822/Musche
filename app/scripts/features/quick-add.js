import { computed } from 'vue';

export function registerQuickAddFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    quickAddType,
    quickAddForm,
    showQuickAddModal,
    activeDropdown,
    itemPool,
    currentSessionId,
    isMobile,
    showMobileTaskInput,
  } = refs;
  const { settings, newItem } = state;
  const {
    getExistingGroups,
    generateUniqueId,
    generateRandomHexColor,
    getDefaultRatio,
    getNameById,
    calculateEstTime,
    ensureItemRecords,
  } = utils;
  const {
    openAlertModal,
    pushHistory,
    triggerTouchHaptic,
    focusElementById = (id) => {
      const input = document.getElementById(id);
      if (input) input.focus();
    },
  } = actions;

  const currentQuickAddGroups = computed(() => {
    const type = quickAddType.value;
    return getExistingGroups(type);
  });

  const openQuickAdd = (type) => {
    quickAddType.value = type;
    quickAddForm.name = '';
    quickAddForm.group = '';
    quickAddForm.defaultRatio = 20;
    showQuickAddModal.value = true;

    setTimeout(() => {
      focusElementById('quick-add-name');
    }, 100);
  };

  const onMusicianSelect = () => {
    const musician = settings.musicians.find((item) => item.id === newItem.musicianId);
    if (musician) newItem.ratio = musician.defaultRatio;
  };

  const confirmQuickAdd = () => {
    const nameStr = quickAddForm.name.trim();
    if (!nameStr) return openAlertModal('名称不能为空');

    const type = quickAddType.value;

    let list = [];
    let label = '';
    if (type === 'instrument') {
      list = settings.instruments;
      label = '乐器';
    } else if (type === 'musician') {
      list = settings.musicians;
      label = '演奏员';
    } else if (type === 'project') {
      list = settings.projects;
      label = '项目';
    }

    if (list.some((item) => item.name.toLowerCase() === nameStr.toLowerCase())) {
      triggerTouchHaptic('Error');
      return openAlertModal('无法添加', `该${label}名称 "${nameStr}" 已存在！`);
    }

    const idPrefix = type === 'project' ? 'P' : (type === 'instrument' ? 'I' : 'M');
    const newId = generateUniqueId(idPrefix);

    const newItemObj = {
      id: newId,
      name: nameStr,
      group: quickAddForm.group.trim(),
      color: generateRandomHexColor(),
      defaultRatio: quickAddForm.defaultRatio || 20,
    };

    if (type === 'project') {
      settings.projects.push(newItemObj);
      newItem.projectId = newId;
    } else if (type === 'instrument') {
      settings.instruments.push(newItemObj);
      newItem.instrumentId = newId;
    } else if (type === 'musician') {
      settings.musicians.push(newItemObj);
      newItem.musicianId = newId;
      onMusicianSelect();
    }

    pushHistory();
    showQuickAddModal.value = false;
    activeDropdown.value = null;
    triggerTouchHaptic('Success');
  };

  const addItemToPool = () => {
    if (!newItem.projectId || !newItem.instrumentId || !newItem.musicianId || !newItem.musicDuration) {
      openAlertModal('信息不完整', '请务必填写所有信息');
      return;
    }

    const rMusician = getDefaultRatio(newItem.musicianId, 'musician');
    const baseInstName = getNameById(newItem.instrumentId, 'instrument');
    let finalName = newItem._autoSuggestedName || baseInstName;

    const siblings = itemPool.value.filter((item) =>
      (item.sessionId || 'S_DEFAULT') === currentSessionId.value &&
      item.projectId === newItem.projectId &&
      item.instrumentId === newItem.instrumentId &&
      item.name === finalName);

    if (siblings.length > 0) {
      finalName = `${finalName} ${siblings.length + 1}`;
    }

    const rawItem = {
      id: generateUniqueId('T'),
      sessionId: currentSessionId.value,
      projectId: newItem.projectId,
      instrumentId: newItem.instrumentId,
      musicianId: newItem.musicianId,
      musicDuration: newItem.musicDuration,
      orchestration: '',
      ratios: { musician: null, project: null, instrument: null },
      ratio: rMusician,
      estDuration: calculateEstTime(newItem.musicDuration, rMusician),
      name: finalName,
    };

    const finalItem = ensureItemRecords(rawItem);
    itemPool.value.push(finalItem);

    newItem._autoSuggestedName = null;

    pushHistory();
    if (isMobile.value) triggerTouchHaptic('Success');
    showMobileTaskInput.value = false;
  };

  return {
    currentQuickAddGroups,
    openQuickAdd,
    onMusicianSelect,
    confirmQuickAdd,
    addItemToPool,
  };
}
