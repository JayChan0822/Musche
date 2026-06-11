import { defineShellState } from './shell-state-factory.js';

export const createExportModalShellState = defineShellState('createExportModalShellState', ({
    refs,
    state,
    computedState,
    actions,
}) => {
    const {
        showExportModal,
    } = refs;
    const {
        exportFilter,
    } = state;
    const {
        exportSessionOptions,
        filteredExportProjects,
        filteredExportMusicians,
        filteredExportInstruments,
        exportDateRange,
        exportPreviewCount,
    } = computedState;
    return {
        reads: {
            exportSessionOptions,
            filteredExportProjects,
            filteredExportMusicians,
            filteredExportInstruments,
            exportDateRange,
            exportPreviewCount,
        },
        models: {
            showExportModal,
        },
        values: {
            exportFilter,
            toggleFilterItem: actions.toggleFilterItem,
            toggleFilterAll: actions.toggleFilterAll,
            confirmExport: actions.confirmExport,
        },
    };
});
