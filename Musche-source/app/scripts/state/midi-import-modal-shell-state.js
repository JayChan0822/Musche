import { defineShellState } from './shell-state-factory.js';

export const createMidiImportModalShellState = defineShellState('createMidiImportModalShellState', {
    reads: [
        'refs.midiBpm',
        'refs.managingProject',
        'refs.midiImportData',
        'helpers.midiGroupData',
        'refs.availableInstrumentGroups',
        'helpers.filteredImportOptions',
        'helpers.currentMidiDisplayList',
    ],
    models: [
        'refs.showMidiImportModal',
        'refs.midiViewMode',
        'refs.importSearchQuery',
    ],
    values: [
        'helpers.midiGroupExpanded',
        'refs.activeImportMenu',
        'refs.importMenuPos',
        'utils.formatUtils.formatSecs',
        'helpers.getNameById',
        'helpers.getSmartName',
        'helpers.openImportMenu',
        'helpers.closeImportMenu',
        'helpers.toggleGroupSelection',
        'helpers.toggleMidiGroupExpand',
        'helpers.confirmMidiImport',
        'helpers.selectImportNewInst',
        'helpers.selectImportInst',
        'helpers.selectImportGroup',
    ],
});
