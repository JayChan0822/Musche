export function createMidiManagerModalShellState({
    reactive,
    refs,
    state,
    computedState,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createMidiManagerModalShellState requires Vue reactive factory');
    }

    const {
        showMidiManager,
        managingProject,
        activeMidiGroupRow,
        midiGroupSearchQuery,
    } = refs;
    const {
        projectMidiGroups,
        filteredMidiGroups,
    } = computedState;

    return reactive({
        get showMidiManager() { return showMidiManager.value; },
        set showMidiManager(value) { showMidiManager.value = value; },
        get managingProject() { return managingProject.value; },
        get projectMidiGroups() { return projectMidiGroups.value; },
        get midiManagerExpandedGroups() { return state.midiManagerExpandedGroups; },
        get activeMidiGroupRow() { return activeMidiGroupRow.value; },
        set activeMidiGroupRow(value) { activeMidiGroupRow.value = value; },
        get midiGroupPos() { return state.midiGroupPos; },
        get midiGroupSearchQuery() { return midiGroupSearchQuery.value; },
        set midiGroupSearchQuery(value) { midiGroupSearchQuery.value = value; },
        get filteredMidiGroups() { return filteredMidiGroups.value; },
        get settings() { return state.settings; },
        triggerMidiImportForProject: actions.triggerMidiImportForProject,
        clearProjectMidi: actions.clearProjectMidi,
        toggleMidiManagerGroup: actions.toggleMidiManagerGroup,
        openMidiGroupDropdown: actions.openMidiGroupDropdown,
        updateMidiDuration: actions.updateMidiDuration,
        removeMidiMapping: actions.removeMidiMapping,
        updateInstrumentGroup: actions.updateInstrumentGroup,
    });
}
