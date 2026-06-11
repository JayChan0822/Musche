import { defineShellState } from './shell-state-factory.js';

export const createMidiImportModalShellState = defineShellState('createMidiImportModalShellState', ({
    refs,
    state,
    computedState,
    actions,
    utils,
}) => {
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
    return {
        reads: {
            midiBpm,
            managingProject,
            midiImportData,
            midiGroupData,
            availableInstrumentGroups,
            filteredImportOptions,
            currentMidiDisplayList,
        },
        models: {
            showMidiImportModal,
            midiViewMode,
            importSearchQuery,
        },
        raw: {
            midiGroupExpanded: () => state.midiGroupExpanded,
            activeImportMenu: () => state.activeImportMenu,
            importMenuPos: () => state.importMenuPos,
        },
        values: {
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
        },
    };
});
