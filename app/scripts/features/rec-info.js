import { computed, reactive, ref } from 'vue';
import { formatRecordingInfoNames, recordingInfoNames, RECORDING_INFO_SEPARATOR } from '../utils/recording-info-names.js';

const REC_INFO_FIELDS = ['studio', 'engineer', 'operator', 'assistant'];

function getMetadataList(settings, type) {
  if (type === 'studio') return settings.studios;
  if (type === 'engineer') return settings.engineers;
  if (type === 'operator') return settings.operators;
  if (type === 'assistant') return settings.assistants;
  return null;
}

export function registerRecInfoFeature(context) {
  const { refs, state, utils, actions } = context;
  const { trackListData, sidebarTab, itemPool, scheduledTasks } = refs;
  const { settings } = state;
  const { generateUniqueId } = utils;
  const {
    pushHistory,
    openConfirmModal = () => {},
    openAlertModal = () => {},
    promptForValue = (message) => prompt(message),
  } = actions;

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

    const editing = sidebarTab.value === 'project';
    const info = (editing ? task.editInfo : task.recordingInfo) || {};

    REC_INFO_FIELDS.forEach((field) => {
      const value = info[field] || (editing && field === 'engineer' ? info.EditEngineer : '');
      recInfoForm[field] = formatRecordingInfoNames(value);
    });
    recInfoForm.notes = info.notes || '';
    activeRecDropdown.value = null;
    recDropdownSearch.value = '';

    showRecInfoModal.value = true;
  };

  const saveRecInfo = () => {
    const task = trackListData.value.taskRef;
    if (!task) return;

    const newData = {};
    REC_INFO_FIELDS.forEach((field) => {
      newData[field] = formatRecordingInfoNames(recInfoForm[field]);
    });
    newData.notes = recInfoForm.notes.trim();

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
    showRecInfoModal.value = false;
  };

  const selectRecOption = (item, type = activeRecDropdown.value) => {
    if (!REC_INFO_FIELDS.includes(type)) return;
    recInfoForm[type] = formatRecordingInfoNames([recInfoForm[type], item.name].join(RECORDING_INFO_SEPARATOR));
    if (activeRecDropdown.value === type) {
      activeRecDropdown.value = null;
      recDropdownSearch.value = '';
    }
  };

  const createRecOption = (type = activeRecDropdown.value, value = recDropdownSearch.value) => {
    const names = recordingInfoNames(value);
    if (!REC_INFO_FIELDS.includes(type) || names.length === 0) return;
    const list = getMetadataList(settings, type) || (settings[`${type}s`] = []);

    let added = false;
    const selected = names.map((name) => {
      const existing = list.find((item) => item.name.toLowerCase() === name.toLowerCase());
      if (existing) return existing.name;
      list.push({ id: generateUniqueId('REC'), name });
      added = true;
      return name;
    });
    if (added) pushHistory();
    selectRecOption({ name: selected.join(RECORDING_INFO_SEPARATOR) }, type);
  };

  const addRecItem = (type, suppliedName) => {
    const list = getMetadataList(settings, type);
    if (!list) return;
    let value = suppliedName === undefined ? recInfoForm[type] : suppliedName;
    if (suppliedName === undefined && (!value || !value.trim())) {
      value = promptForValue(`Enter new ${type} name:`);
    }

    if (!value || !value.trim()) return;

    const cleanValue = value.trim();
    const exists = list.some((item) => item.name.toLowerCase() === cleanValue.toLowerCase());

    if (!exists) {
      list.push({
        id: generateUniqueId('META'),
        name: cleanValue,
      });
      pushHistory();
    }
  };

  const removeRecItem = (type, id) => {
    const list = getMetadataList(settings, type);
    if (!list) return;

    const idx = list.findIndex((item) => item.id === id);
    if (idx === -1) return;

    list.splice(idx, 1);
    pushHistory();
  };

  const updateRecordingInfoReferences = (type, oldName, targetName) => {
    const oldKey = oldName.toLowerCase();
    const updateTask = (task) => {
      for (const info of [task.recordingInfo, task.editInfo]) {
        const names = recordingInfoNames(info?.[type]);
        if (names.some((name) => name.toLowerCase() === oldKey)) {
          info[type] = formatRecordingInfoNames(names.map((name) => name.toLowerCase() === oldKey ? targetName : name).join(RECORDING_INFO_SEPARATOR));
        }
      }
    };

    itemPool?.value?.forEach(updateTask);
    scheduledTasks.value.forEach(updateTask);
  };

  const handleRecRename = (type, item, event) => {
    const newName = event.target.value.trim();
    const oldName = item.name;

    if (!newName) {
      event.target.value = oldName;
      return;
    }
    if (newName === oldName) return;

    const list = getMetadataList(settings, type);
    if (!list) return;

    const existing = list.find((candidate) =>
      candidate.name.toLowerCase() === newName.toLowerCase() && candidate.id !== item.id
    );

    if (existing) {
      event.target.value = oldName;

      openConfirmModal(
        '合并条目',
        `检测到 "${existing.name}" 已存在。\n确定要将 "${oldName}" 合并归入 "${existing.name}" 吗？\n\n⚠ 注意：所有使用 "${oldName}" 的任务都将自动更新。`,
        () => {
          updateRecordingInfoReferences(type, oldName, existing.name);

          const idx = list.findIndex((candidate) => candidate.id === item.id);
          if (idx !== -1) list.splice(idx, 1);

          pushHistory();
          openAlertModal('合并成功', `相关任务信息已更新为 "${existing.name}"。`);
        },
        true,
        '确认合并',
      );
    } else {
      item.name = newName;
      updateRecordingInfoReferences(type, oldName, newName);
      pushHistory();
    }
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
    handleRecRename,
  };
}
