import { defineShellState } from './shell-state-factory.js';

export const createMidiManagerModalShellState = defineShellState('createMidiManagerModalShellState', ({
    refs,
    state,
    computedState,
    actions,
}) => {
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
    return {
        reads: {
            managingProject,
            projectMidiGroups,
            filteredMidiGroups,
        },
        models: {
            showMidiManager,
            activeMidiGroupRow,
            midiGroupSearchQuery,
        },
        raw: {
            midiManagerExpandedGroups: () => state.midiManagerExpandedGroups,
            midiGroupPos: () => state.midiGroupPos,
            settings: () => state.settings,
        },
        values: {
            triggerMidiImportForProject: actions.triggerMidiImportForProject,
            clearProjectMidi: actions.clearProjectMidi,
            toggleMidiManagerGroup: actions.toggleMidiManagerGroup,
            openMidiGroupDropdown: actions.openMidiGroupDropdown,
            updateMidiDuration: actions.updateMidiDuration,
            removeMidiMapping: actions.removeMidiMapping,
            updateInstrumentGroup: actions.updateInstrumentGroup,
        },
    };
});
