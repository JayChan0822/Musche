export function registerSettingsFeature(context) {
  const { refs, state, utils, actions } = context;
  const {
    itemPool,
    scheduledTasks,
    settingsExpandedGroups,
    newSettingsItem,
  } = refs;
  const { settings } = state;
  const { generateUniqueId, generateRandomHexColor } = utils;
  const {
    pushHistory,
    triggerTouchHaptic,
    openConfirmModal,
    openAlertModal,
    cleanupEmptySchedules,
    autoUpdateEfficiency,
  } = actions;

  function getListForType(type) {
    if (type === 'instrument') return settings.instruments;
    if (type === 'musician') return settings.musicians;
    if (type === 'project') return settings.projects;
    return [];
  }

  function setListForType(type, nextList) {
    if (type === 'instrument') settings.instruments = nextList;
    else if (type === 'musician') settings.musicians = nextList;
    else if (type === 'project') settings.projects = nextList;
  }

  function getIdKeyForType(type) {
    if (type === 'instrument') return 'instrumentId';
    if (type === 'musician') return 'musicianId';
    return 'projectId';
  }

  function toggleSettingsGroup(type, groupName) {
    const key = `${type}|${groupName}`;
    if (settingsExpandedGroups.has(key)) settingsExpandedGroups.delete(key);
    else settingsExpandedGroups.add(key);
  }

  function getSettingsGroupedList(type) {
    const groups = {};
    const defaultKey = '未分组';

    getListForType(type).forEach((item) => {
      const groupName = item.group && item.group.trim() ? item.group : defaultKey;
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => {
        if (a === defaultKey) return 1;
        if (b === defaultKey) return -1;
        return a.localeCompare(b, 'zh-CN', { numeric: true });
      })
      .map((key) => ({
        name: key === defaultKey ? '' : key,
        items: groups[key].sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true })),
      }));
  }

  function getAllSettingsGrouped() {
    return {
      project: getSettingsGroupedList('project'),
      instrument: getSettingsGroupedList('instrument'),
      musician: getSettingsGroupedList('musician'),
    };
  }

  function getExistingGroups(type) {
    let resolvedType = type;
    if (typeof type === 'object' && type !== null && 'value' in type) {
      resolvedType = type.value;
    }
    if (!resolvedType) return [];

    const realType = String(resolvedType).replace('mobile_', '');
    const groups = new Set();
    getListForType(realType).forEach((item) => {
      if (item.group && typeof item.group === 'string' && item.group.trim() !== '') {
        groups.add(item.group.trim());
      }
    });
    return Array.from(groups).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }

  function renameGroup(type, oldName, newName) {
    const finalNewName = newName.trim();
    if (oldName === finalNewName) return;

    getListForType(type).forEach((item) => {
      const currentGroup = (item.group || '').trim();
      if (currentGroup === (oldName || '').trim()) {
        item.group = finalNewName;
      }
    });
    pushHistory();
  }

  function addSettingsItem(type) {
    const form = newSettingsItem[type];
    const nameStr = form.name.trim();
    const groupStr = form.group.trim();

    if (!nameStr && !groupStr) {
      return openAlertModal('无法添加', '请至少输入 名称 或 分组。');
    }

    const list = getListForType(type);
    if (nameStr) {
      const existingItem = list.find((item) => item.name.toLowerCase() === nameStr.toLowerCase());
      if (existingItem) {
        if (existingItem.group !== groupStr) {
          existingItem.group = groupStr;
          if (groupStr) settingsExpandedGroups.add(`${type}|${groupStr}`);
          pushHistory();
          triggerTouchHaptic('Success');
          form.name = '';
          return;
        }

        triggerTouchHaptic('Error');
        return openAlertModal('重复添加', '该项目已存在于当前分组中。');
      }
    }

    const idPrefix = type === 'project' ? 'P' : (type === 'instrument' ? 'I' : 'M');
    const nextItem = {
      id: generateUniqueId(idPrefix),
      name: nameStr,
      group: groupStr,
      color: generateRandomHexColor(),
    };
    if (type === 'musician') nextItem.defaultRatio = 20;

    list.push(nextItem);
    if (groupStr) settingsExpandedGroups.add(`${type}|${groupStr}`);
    form.name = '';
    pushHistory();
    triggerTouchHaptic('Success');
  }

  function deleteTypeItem(type, id, title) {
    openConfirmModal(
      title,
      `确定删除该${title.replace('删除', '')}吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！`,
      () => {
        setListForType(type, getListForType(type).filter((item) => item.id !== id));
        const idKey = getIdKeyForType(type);
        itemPool.value = itemPool.value.filter((item) => item[idKey] !== id);
        scheduledTasks.value = scheduledTasks.value.filter((task) => task[idKey] !== id);
        cleanupEmptySchedules();
        pushHistory();
        triggerTouchHaptic('Medium');
      },
      true,
    );
  }

  function removeInstrument(id) {
    deleteTypeItem('instrument', id, '删除乐器');
  }

  function removeMusician(id) {
    deleteTypeItem('musician', id, '删除演奏员');
  }

  function deleteProject(projectId) {
    deleteTypeItem('project', projectId, '删除项目');
  }

  function removeSettingsItem(type, id) {
    if (type === 'instrument') removeInstrument(id);
    else if (type === 'musician') removeMusician(id);
    else if (type === 'project') deleteProject(id);
  }

  function clearTypeList(type, title) {
    const list = getListForType(type);
    if (list.length === 0) return;

    openConfirmModal(
      title,
      `确定要清空所有${title.replace('清空', '').replace('库', '')}吗？\n⚠ 警告：所有关联的任务（任务池及日程）都将被永久删除！`,
      () => {
        const idsToDelete = new Set(list.map((item) => item.id));
        setListForType(type, []);
        const idKey = getIdKeyForType(type);
        itemPool.value = itemPool.value.filter((item) => !idsToDelete.has(item[idKey]));
        scheduledTasks.value = scheduledTasks.value.filter((task) => !idsToDelete.has(task[idKey]));
        cleanupEmptySchedules();
        pushHistory();
        triggerTouchHaptic('Medium');
      },
      true,
    );
  }

  function clearAllInstruments() {
    clearTypeList('instrument', '清空乐器库');
  }

  function clearAllMusicians() {
    clearTypeList('musician', '清空人员库');
  }

  function clearAllProjects() {
    clearTypeList('project', '清空项目库');
  }

  function clearSettingsList(type) {
    if (type === 'instrument') clearAllInstruments();
    else if (type === 'musician') clearAllMusicians();
    else if (type === 'project') clearAllProjects();
  }

  function getOrCreateSettingItem(type, name, group = '') {
    if (!name || !name.trim()) return '';

    const list = getListForType(type);
    const existing = list.find((item) => item.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) return existing.id;

    const idPrefix = type === 'project' ? 'P' : (type === 'instrument' ? 'I' : 'M');
    const nextItem = {
      id: generateUniqueId(idPrefix),
      name: name.trim(),
      group: group.trim(),
      color: generateRandomHexColor(),
    };
    if (type === 'musician') nextItem.defaultRatio = 20;

    list.push(nextItem);
    return nextItem.id;
  }

  function addProject() {
    settings.projects.push({
      id: generateUniqueId('P'),
      name: `新项目${settings.projects.length + 1}`,
      group: '',
    });
    pushHistory();
  }

  function handleItemRename(type, item, event) {
    const newName = event.target.value.trim();
    const oldName = item.name;

    if (!newName) {
      event.target.value = oldName;
      return;
    }
    if (newName === oldName) return;

    const list = getListForType(type);
    const idKey = getIdKeyForType(type);
    const targetItem = list.find((entry) => entry.name.toLowerCase() === newName.toLowerCase() && entry.id !== item.id);

    if (targetItem) {
      event.target.value = oldName;
      openConfirmModal(
        '合并条目',
        `检测到 "${targetItem.name}" 已存在。\n确定要将 "${oldName}" 合并归入 "${targetItem.name}" 吗？\n\n⚠ 警告：\n1. "${oldName}" 下的所有任务将转移给 "${targetItem.name}"。\n2. "${oldName}" 将被永久删除。\n3. 此操作不可撤销。`,
        () => {
          itemPool.value.forEach((task) => {
            if (task[idKey] === item.id) task[idKey] = targetItem.id;
          });
          scheduledTasks.value.forEach((task) => {
            if (task[idKey] === item.id) task[idKey] = targetItem.id;
          });

          const index = list.findIndex((entry) => entry.id === item.id);
          if (index !== -1) list.splice(index, 1);

          if (type === 'musician') {
            autoUpdateEfficiency(targetItem.id, 'musician', false);
          }

          pushHistory();
          triggerTouchHaptic('Success');
          openAlertModal('合并成功', `已将相关任务全部转移至 "${targetItem.name}"。`);
        },
        true,
        '确认合并',
        '取消',
      );
      return;
    }

    item.name = newName;
    pushHistory();
  }

  return {
    toggleSettingsGroup,
    getSettingsGroupedList,
    getAllSettingsGrouped,
    getExistingGroups,
    renameGroup,
    addSettingsItem,
    removeInstrument,
    removeMusician,
    deleteProject,
    removeSettingsItem,
    clearAllInstruments,
    clearAllMusicians,
    clearAllProjects,
    clearSettingsList,
    getOrCreateSettingItem,
    addProject,
    handleItemRename,
  };
}
