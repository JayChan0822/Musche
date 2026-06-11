import { computed, reactive, ref, watch } from 'vue';

export function registerDropdownsFeature(context) {
  const { refs, state, actions = {} } = context;
  const {
    activeDropdown,
    showMobileMenu,
    showProfileMenu,
    settingsGroupFocus,
    showGroupSuggestions,
    editingItem,
  } = refs;
  const { settings, newItem } = state;
  const {
    onMusicianSelect = () => {},
    getSettingsNameFocus = () => null,
    getActiveRecDropdown = () => null,
    querySelector = (selector) => document.querySelector(selector),
    setTimeoutFn = setTimeout,
  } = actions;

  const dropdownSearch = ref('');
  const dropdownExpandedGroups = reactive(new Set());
  const activeGroupFilter = ref('全部');

  const getRealType = (type) => String(type || '').replace('mobile_', '').replace('edit_', '');

  const getListForType = (type) => {
    const realType = getRealType(type);
    if (realType === 'project') return settings.projects;
    if (realType === 'instrument') return settings.instruments;
    if (realType === 'musician') return settings.musicians;
    return [];
  };

  const toggleDropdownGroup = (groupName) => {
    if (dropdownExpandedGroups.has(groupName)) {
      dropdownExpandedGroups.delete(groupName);
    } else {
      dropdownExpandedGroups.add(groupName);
    }
  };

  watch(dropdownSearch, (value) => {
    if (!value || !value.trim()) {
      dropdownExpandedGroups.clear();
    }
  }, { flush: 'sync' });

  const toggleDropdown = (type) => {
    if (activeDropdown.value === type) {
      activeDropdown.value = null;
      return;
    }

    showMobileMenu.value = false;
    showProfileMenu.value = false;
    activeDropdown.value = type;
    dropdownSearch.value = '';
    activeGroupFilter.value = '全部';
    dropdownExpandedGroups.clear();

    setTimeoutFn(() => {
      const input = querySelector('.custom-dropdown-menu input[placeholder*="搜索"]');
      if (input) input.focus();
    }, 50);
  };

  const availableGroups = computed(() => {
    const type = activeDropdown.value;
    if (!type) return [];

    const groups = new Set(
      getListForType(type).map((item) => (item.group && item.group.trim()) ? item.group : '未分组'),
    );
    const sorted = Array.from(groups).sort((a, b) => {
      if (a === '未分组') return 1;
      if (b === '未分组') return -1;
      return a.localeCompare(b, 'zh-CN');
    });

    return ['全部', ...sorted];
  });

  const closeDropdowns = (event) => {
    const insideSelect = event.target.closest('.custom-select-container');
    const insideUser = event.target.closest('.user-menu-container');

    if (!insideSelect && !insideUser) {
      activeDropdown.value = null;
      showProfileMenu.value = false;
      showMobileMenu.value = false;
    }

    const insideSettingsGroup = event.target.closest('.settings-group-wrapper');
    if (!insideSettingsGroup && settingsGroupFocus.value) {
      settingsGroupFocus.value = null;
    }

    const settingsNameFocus = getSettingsNameFocus();
    const insideSettingsName = event.target.closest('.settings-name-wrapper');
    if (!insideSettingsName && settingsNameFocus?.value) {
      settingsNameFocus.value = null;
    }

    const insideQuickAddGroup = event.target.closest('.quick-add-group-wrapper');
    if (!insideQuickAddGroup && showGroupSuggestions.value) {
      showGroupSuggestions.value = false;
    }

    const activeRecDropdown = getActiveRecDropdown();
    const insideRec = event.target.closest('.rec-dropdown-wrapper');
    if (!insideRec && activeRecDropdown?.value) {
      activeRecDropdown.value = null;
    }
  };

  const filteredOptions = computed(() => {
    const search = dropdownSearch.value.toLowerCase();
    const type = activeDropdown.value;
    if (!type) return [];

    let result = getListForType(type).filter((item) => item.name.toLowerCase().includes(search));

    if (activeGroupFilter.value !== '全部') {
      result = result.filter((item) => {
        const groupName = (item.group && item.group.trim()) ? item.group : '未分组';
        return groupName === activeGroupFilter.value;
      });
    }

    const sortedGroupNames = availableGroups.value.filter((groupName) => groupName !== '全部');
    return sortedGroupNames.flatMap((groupName) => {
      const groupItems = result.filter((item) => {
        const itemGroupName = (item.group && item.group.trim()) ? item.group : '未分组';
        return itemGroupName === groupName;
      });

      return groupItems.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN', { numeric: true }));
    });
  });

  const getGroupedOptions = (list) => {
    const groups = {};
    const defaultKey = '未分组';

    list.forEach((item) => {
      const groupName = item.group && item.group.trim() ? item.group : defaultKey;
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(item);
    });

    return Object.keys(groups)
      .sort((a, b) => {
        if (a === defaultKey) return 1;
        if (b === defaultKey) return -1;
        return a.localeCompare(b, 'zh-CN');
      })
      .map((name) => ({
        name,
        items: groups[name],
      }));
  };

  const selectOption = (type, item) => {
    if (activeDropdown.value && activeDropdown.value.startsWith('edit_')) {
      const realType = getRealType(activeDropdown.value);

      if (realType === 'project') editingItem.value.projectId = item.id;
      else if (realType === 'instrument') editingItem.value.instrumentId = item.id;
      else if (realType === 'musician') editingItem.value.musicianId = item.id;

      activeDropdown.value = null;
      return;
    }

    if (type === 'project') newItem.projectId = item.id;
    if (type === 'instrument') newItem.instrumentId = item.id;
    if (type === 'musician') {
      newItem.musicianId = item.id;
      onMusicianSelect();
    }
    activeDropdown.value = null;
  };

  return {
    dropdownSearch,
    dropdownExpandedGroups,
    activeGroupFilter,
    availableGroups,
    filteredOptions,
    toggleDropdownGroup,
    toggleDropdown,
    closeDropdowns,
    getGroupedOptions,
    selectOption,
  };
}
