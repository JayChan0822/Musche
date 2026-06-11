export function createCsvImportModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createCsvImportModalShellState requires Vue reactive factory');
    }

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

    return reactive({
        get showCsvImportModal() { return showCsvImportModal.value; },
        set showCsvImportModal(value) { showCsvImportModal.value = value; },
        get activeImportTab() { return activeImportTab.value; },
        set activeImportTab(value) { activeImportTab.value = value; },
        get csvSearchQuery() { return csvSearchQuery.value; },
        set csvSearchQuery(value) { csvSearchQuery.value = value; },
        get csvImportConfig() { return csvImportConfig; },
        get csvImportData() { return csvImportData.value; },
        get groupedCsvData() { return groupedCsvData.value; },
        get collapsedProjects() { return collapsedProjects; },
        refreshCsvStatus,
        toggleAllRows,
        toggleProjectCollapse,
        isGroupSelected,
        toggleGroupSelection,
        confirmCsvImport,
    });
}
