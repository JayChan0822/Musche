import { defineShellState } from './shell-state-factory.js';

export const createExportModalShellState = defineShellState('createExportModalShellState', {
    reads: [
        'helpers.exportSessionOptions',
        'helpers.filteredExportProjects',
        'helpers.filteredExportMusicians',
        'helpers.filteredExportInstruments',
        'helpers.exportDateRange',
        'helpers.exportPreviewCount',
    ],
    models: [
        'refs.showExportModal',
    ],
    values: [
        'refs.exportFilter',
        'helpers.dataIoHandlers.toggleFilterItem',
        'helpers.dataIoHandlers.toggleFilterAll',
        'helpers.dataIoHandlers.confirmExport',
    ],
});
