import { defineShellState } from './shell-state-factory.js';

export const createCsvImportModalShellState = defineShellState('createCsvImportModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showCsvImportModal,
        activeImportTab,
        csvSearchQuery,
        csvImportData,
        groupedCsvData,
    } = refs;
    const {
        csvImportConfig,
        collapsedProjects,
    } = state;
    const {
        refreshCsvStatus,
        toggleAllRows,
        toggleProjectCollapse,
        isGroupSelected,
        toggleGroupSelection,
        confirmCsvImport,
    } = actions;
    return {
        reads: {
            csvImportData,
            groupedCsvData,
        },
        models: {
            showCsvImportModal,
            activeImportTab,
            csvSearchQuery,
        },
        values: {
            csvImportConfig,
            collapsedProjects,
            refreshCsvStatus,
            toggleAllRows,
            toggleProjectCollapse,
            isGroupSelected,
            toggleGroupSelection,
            confirmCsvImport,
        },
    };
});
