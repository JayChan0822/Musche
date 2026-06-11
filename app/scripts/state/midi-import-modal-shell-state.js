export function createMidiImportModalShellState({
    reactive,
    refs,
    state,
    computedState,
    actions,
    utils,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createMidiImportModalShellState requires Vue reactive factory');
    }

    const {
        showMidiImportModal,
        midiBpm,
        managingProject,
        midiViewMode,
        midiImportData,
        importSearchQuery,
    } = refs;
    const {
        midiGroupData,
        availableInstrumentGroups,
        filteredImportOptions,
        currentMidiDisplayList,
    } = computedState;

    return reactive({
        get showMidiImportModal() { return showMidiImportModal.value; },
        set showMidiImportModal(value) { showMidiImportModal.value = value; },
        get midiBpm() { return midiBpm.value; },
        get managingProject() { return managingProject.value; },
        get midiViewMode() { return midiViewMode.value; },
        set midiViewMode(value) { midiViewMode.value = value; },
        get midiImportData() { return midiImportData.value; },
        get midiGroupData() { return midiGroupData.value; },
        get midiGroupExpanded() { return state.midiGroupExpanded; },
        get activeImportMenu() { return state.activeImportMenu; },
        get importMenuPos() { return state.importMenuPos; },
        get importSearchQuery() { return importSearchQuery.value; },
        set importSearchQuery(value) { importSearchQuery.value = value; },
        get availableInstrumentGroups() { return availableInstrumentGroups.value; },
        get filteredImportOptions() { return filteredImportOptions.value; },
        get currentMidiDisplayList() { return currentMidiDisplayList.value; },
        formatSecs: utils.formatSecs,
        getNameById: actions.getNameById,
        getSmartName: actions.getSmartName,
        openImportMenu: actions.openImportMenu,
        closeImportMenu: actions.closeImportMenu,
        toggleGroupSelection: actions.toggleGroupSelection,
        toggleMidiGroupExpand: actions.toggleMidiGroupExpand,
        confirmMidiImport: actions.confirmMidiImport,
        selectImportNewInst: actions.selectImportNewInst,
        selectImportInst: actions.selectImportInst,
        selectImportGroup: actions.selectImportGroup,
    });
}
