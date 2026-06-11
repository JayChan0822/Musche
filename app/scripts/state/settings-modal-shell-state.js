export function createSettingsModalShellState({
    reactive,
    refs,
    state,
    computedState,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createSettingsModalShellState requires Vue reactive factory');
    }

    const {
        showSettings,
        settingsNameFocus,
        settingsGroupFocus,
        showMetadataManager,
    } = refs;
    const {
        settings,
        settingsExpandedGroups,
        newSettingsItem,
        newRecInputs,
    } = state;
    const {
        allSettingsGrouped,
    } = computedState;

    return reactive({
        get showSettings() { return showSettings.value; },
        set showSettings(value) { showSettings.value = value; },
        get settings() { return settings; },
        get settingsExpandedGroups() { return settingsExpandedGroups; },
        get allSettingsGrouped() { return allSettingsGrouped.value; },
        get newSettingsItem() { return newSettingsItem; },
        get settingsNameFocus() { return settingsNameFocus.value; },
        set settingsNameFocus(value) { settingsNameFocus.value = value; },
        get settingsGroupFocus() { return settingsGroupFocus.value; },
        set settingsGroupFocus(value) { settingsGroupFocus.value = value; },
        get showMetadataManager() { return showMetadataManager.value; },
        set showMetadataManager(value) { showMetadataManager.value = value; },
        get newRecInputs() { return newRecInputs; },
        pushHistory: actions.pushHistory,
        onSettingsScroll: actions.onSettingsScroll,
        toggleAllGroups: actions.toggleAllGroups,
        isAllGroupsExpanded: actions.isAllGroupsExpanded,
        clearSettingsList: actions.clearSettingsList,
        onSettingsDragOver: actions.onSettingsDragOver,
        onSettingsDragLeave: actions.onSettingsDragLeave,
        onSettingsDrop: actions.onSettingsDrop,
        toggleSettingsGroup: actions.toggleSettingsGroup,
        renameGroup: actions.renameGroup,
        onSettingsItemDragStart: actions.onSettingsItemDragStart,
        onSettingsItemDragEnd: actions.onSettingsItemDragEnd,
        openMidiManager: actions.openMidiManager,
        openColorPicker: actions.openColorPicker,
        handleItemRename: actions.handleItemRename,
        disableRowDrag: actions.disableRowDrag,
        enableRowDrag: actions.enableRowDrag,
        openProjectInfoModal: actions.openProjectInfoModal,
        removeSettingsItem: actions.removeSettingsItem,
        updateInputRect: actions.updateInputRect,
        getFloatingStyle: actions.getFloatingStyle,
        getUngroupedItems: actions.getUngroupedItems,
        getExistingGroups: actions.getExistingGroups,
        addSettingsItem: actions.addSettingsItem,
        handleRecRename: actions.handleRecRename,
        removeRecItem: actions.removeRecItem,
        addRecItem: actions.addRecItem,
        triggerCSV: actions.triggerCSV,
        handleCSVImport: actions.handleCSVImport,
        factoryReset: actions.factoryReset,
    });
}
