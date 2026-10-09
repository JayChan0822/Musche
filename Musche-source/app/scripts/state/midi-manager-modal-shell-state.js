import { defineShellState } from './shell-state-factory.js';

export const createMidiManagerModalShellState = defineShellState('createMidiManagerModalShellState', {
    reads: [
        'refs.managingProject',
        'refs.projectMidiGroups',
        'helpers.filteredMidiGroups',
    ],
    models: [
        'refs.showMidiManager',
        'refs.activeMidiGroupRow',
        'refs.midiGroupSearchQuery',
    ],
    values: [
        'refs.midiManagerExpandedGroups',
        'refs.midiGroupPos',
        'state.settings',
        'helpers.triggerMidiImportForProject',
        'helpers.clearProjectMidi',
        'helpers.toggleMidiManagerGroup',
        'helpers.openMidiGroupDropdown',
        'helpers.updateMidiDuration',
        'helpers.removeMidiMapping',
        'helpers.updateInstrumentGroup',
    ],
});
