import { defineShellState } from './shell-state-factory.js';

export const createCsvImportModalShellState = defineShellState('createCsvImportModalShellState', {
    reads: [
        'refs.csvImportData',
        'helpers.groupedCsvData',
    ],
    models: [
        'refs.showCsvImportModal',
        'refs.activeImportTab',
        'refs.csvSearchQuery',
    ],
    values: [
        'refs.csvImportConfig',
        'refs.collapsedProjects',
        'helpers.refreshCsvStatus',
        'helpers.toggleAllRows',
        'helpers.toggleProjectCollapse',
        'helpers.isGroupSelected',
        'helpers.toggleGroupSelection',
        'helpers.confirmCsvImport',
    ],
});
