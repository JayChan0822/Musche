import { defineShellState } from './shell-state-factory.js';

export const createSettingsModalShellState = defineShellState('createSettingsModalShellState', ({
    refs,
    state,
    computedState,
    actions,
}) => {
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
    return {
        reads: {
            allSettingsGrouped,
        },
        models: {
            showSettings,
            settingsNameFocus,
            settingsGroupFocus,
            showMetadataManager,
        },
        values: {
            settings,
            settingsExpandedGroups,
            newSettingsItem,
            newRecInputs,
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
        },
    };
});
