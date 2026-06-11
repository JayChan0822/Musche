import { computed, reactive, ref } from 'vue';

export function registerSettingsSyncFeature(context) {
  const { refs, state, utils, actions = {} } = context;
  const {
    settingsExpandedGroups,
    settingsGroupFocus,
  } = refs;
  const { settings } = state;
  const { generateUniqueId, generateRandomHexColor } = utils;
  const {
    getWindowInnerHeight = () => window.innerHeight,
  } = actions;

  const inputRects = reactive({
    name: { top: 0, left: 0, width: 0, height: 0 },
    group: { top: 0, left: 0, width: 0, height: 0 },
  });
  const settingsNameFocus = ref(null);

  function getListForType(type) {
    if (type === 'instrument') return settings.instruments;
    if (type === 'musician') return settings.musicians;
    if (type === 'project') return settings.projects;
    return [];
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

  const updateInputRect = (event, kind) => {
    const wrapperClass = kind === 'name' ? '.settings-name-wrapper' : '.settings-group-wrapper';
    const el = event.target.closest(wrapperClass);
    if (el) {
      const rect = el.getBoundingClientRect();
      inputRects[kind] = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
    }
  };

  const getFloatingStyle = (kind) => {
    const rect = inputRects[kind];
    const windowHeight = getWindowInnerHeight();
    const inputBottom = rect.top + rect.height;
    const spaceBelow = windowHeight - inputBottom;
    const menuHeight = 220;
    const isDropUp = spaceBelow < menuHeight;

    const style = {
      position: 'fixed',
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      margin: 0,
      zIndex: 99999,
    };

    if (isDropUp) {
      style.top = 'auto';
      style.bottom = `${windowHeight - rect.top + 5}px`;
      style.transformOrigin = 'bottom center';
    } else {
      style.top = `${inputBottom + 5}px`;
      style.bottom = 'auto';
      style.transformOrigin = 'top center';
    }

    return style;
  };

  const onSettingsScroll = () => {
    if (settingsNameFocus.value || settingsGroupFocus.value) {
      settingsNameFocus.value = null;
      settingsGroupFocus.value = null;
    }
  };

  const getUngroupedItems = (type) =>
    getListForType(type)
      .filter((item) => !item.group || !item.group.trim())
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  const sortSettingsList = (list) => [...list].sort((a, b) => {
    const gA = (a.group || '').trim();
    const gB = (b.group || '').trim();

    if (gA && !gB) return -1;
    if (!gA && gB) return 1;
    if (gA !== gB) return gA.localeCompare(gB, 'zh-CN');

    return (a.name || '').localeCompare(b.name || '', 'zh-CN');
  });

  const findSettingId = (type, name) => {
    if (!name) return null;
    const list = settings[`${type}s`];
    if (!list) return null;

    const targetName = name.trim().toLowerCase();
    const found = list.find((item) => item.name.trim().toLowerCase() === targetName);
    return found ? found.id : null;
  };

  const getOrCreateProjectId = (projectName) => {
    let project = settings.projects.find((item) => item.name === projectName);
    if (!project) {
      project = { id: generateUniqueId('P'), name: projectName, color: generateRandomHexColor() };
      settings.projects.push(project);
    }
    return project.id;
  };

  const sortedInstruments = computed(() => sortSettingsList(settings.instruments));
  const sortedMusicians = computed(() => sortSettingsList(settings.musicians));
  const sortedProjects = computed(() => sortSettingsList(settings.projects));

  const isAllGroupsExpanded = (type) => {
    const groups = getSettingsGroupedList(type);
    if (groups.length === 0) return false;
    return groups.every((group) => settingsExpandedGroups.has(`${type}|${group.name}`));
  };

  const toggleAllGroups = (type) => {
    const groups = getSettingsGroupedList(type);
    const isAllOpen = isAllGroupsExpanded(type);

    if (isAllOpen) {
      groups.forEach((group) => settingsExpandedGroups.delete(`${type}|${group.name}`));
    } else {
      groups.forEach((group) => settingsExpandedGroups.add(`${type}|${group.name}`));
    }
  };

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

  return {
    inputRects,
    settingsNameFocus,
    updateInputRect,
    getFloatingStyle,
    onSettingsScroll,
    getUngroupedItems,
    sortSettingsList,
    sortedInstruments,
    sortedMusicians,
    sortedProjects,
    isAllGroupsExpanded,
    toggleAllGroups,
    toggleSettingsGroup,
    getSettingsGroupedList,
    allSettingsGrouped: computed(() => getAllSettingsGrouped()),
    findSettingId,
    getOrCreateProjectId,
    getExistingGroups,
    getOrCreateSettingItem,
  };
}
