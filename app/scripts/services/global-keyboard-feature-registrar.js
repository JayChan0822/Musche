import { registerGlobalKeyboardFeature } from '../features/global-keyboard.js';

const pick = (source, keys) => {
    const result = {};
    keys.forEach((key) => { result[key] = source[key]; });
    return result;
};

const KEYBOARD_REF_KEYS = [
    'showSettings',
    'showEditor',
    'showTrackList',
    'showAuthModal',
    'showCropModal',
    'showMobileMenu',
    'showColorPickerModal',
    'showMobileTaskInput',
    'showQuickAddModal',
    'showRecInfoModal',
    'showConfirmModal',
    'showInputModal',
    'showSplitModal',
    'showCreditModal',
    'showMidiManager',
    'showMidiImportModal',
    'showCsvImportModal',
    'showProjectInfoModal',
    'showDurationPicker',
    'showImportModal',
    'showProfileMenu',
    'showGroupSuggestions',
    'activeRecDropdown',
    'activeMidiGroupRow',
    'activeDropdown',
    'settingsGroupFocus',
    'selectedTaskId',
    'selectedPoolIds',
    'selectedSource',
    'isMobile',
    'currentSessionId',
    'currentView',
    'sidebarTab',
    'sortKey',
    'activeColorKey',
    'scheduledTasks',
    'itemPool',
    'lastPoolFocusId',
    'lastPoolClickId',
];

export function wireGlobalKeyboardFeature(assembly) {
    const { helpers } = assembly;
    const { activeImportMenu, expandedGroups } = assembly.refs;
    return registerGlobalKeyboardFeature({
        refs: pick(assembly.refs, KEYBOARD_REF_KEYS),
        state: {
            activeImportMenu,
            expandedGroups,
            expandedStatsIds: {
                has: (id) => assembly.refs.expandedStatsIds.has(id),
                add: (id) => assembly.refs.expandedStatsIds.add(id),
                clear: () => assembly.refs.expandedStatsIds.clear(),
            },
        },
        actions: {
            closePicker: (...args) => assembly.features.pickerControls.closePicker(...args),
            closeConfirmModal: (...args) => helpers.closeConfirmModal(...args),
            closeInputModal: (...args) => helpers.closeInputModal(...args),
            closeImportMenu: (...args) => helpers.closeImportMenu(...args),
            toggleAllProjectCollapse: (...args) => helpers.toggleAllProjectCollapse(...args),
            undo: (...args) => helpers.undo(...args),
            redo: (...args) => helpers.redo(...args),
            switchView: (...args) => assembly.features.viewNavigation.switchView(...args),
            selectTask: (...args) => assembly.features.poolInteractions.selectTask(...args),
            moveTask: (...args) => assembly.features.schedule.moveTask(...args),
            checkCanDeleteSplit: (...args) => helpers.checkCanDeleteSplit(...args),
            restoreSplitTime: (...args) => helpers.restoreSplitTime(...args),
            cleanupEmptySchedules: (...args) => assembly.features.schedule.cleanupEmptySchedules(...args),
            clearSelection: (...args) => assembly.features.poolInteractions.clearSelection(...args),
            pushHistory: (...args) => helpers.pushHistory(...args),
            isResourceCompleted: (...args) => helpers.isResourceCompleted(...args),
            clearPoolRecord: (...args) => helpers.clearPoolRecord(...args),
            clearAggregateRecords: (...args) => helpers.clearAggregateRecords(...args),
            openAlertModal: (...args) => helpers.openAlertModal(...args),

            getSettings: () => assembly.state.settings,
            getSettingsNameFocus: () => assembly.refs.settingsNameFocus,
            getFilteredSidebarList: () => assembly.refs.filteredSidebarList.value,
            getProjectMidiGroups: () => assembly.refs.projectMidiGroups.value,
            getMidiManagerExpandedGroups: () => assembly.refs.midiManagerExpandedGroups,
            getGroupedItemPool: () => assembly.refs.groupedItemPool.value,
            getMusicianStats: () => assembly.refs.musicianStats.value,
        },
    });
}
