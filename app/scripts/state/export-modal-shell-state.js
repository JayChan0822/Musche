export function createExportModalShellState({
    reactive,
    refs,
    state,
    computedState,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createExportModalShellState requires Vue reactive factory');
    }

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

    return reactive({
        get showExportModal() { return showExportModal.value; },
        set showExportModal(value) { showExportModal.value = value; },
        get exportFilter() { return exportFilter; },
        get exportSessionOptions() { return exportSessionOptions.value; },
        get filteredExportProjects() { return filteredExportProjects.value; },
        get filteredExportMusicians() { return filteredExportMusicians.value; },
        get filteredExportInstruments() { return filteredExportInstruments.value; },
        get exportDateRange() { return exportDateRange.value; },
        get exportPreviewCount() { return exportPreviewCount.value; },
        toggleFilterItem: actions.toggleFilterItem,
        toggleFilterAll: actions.toggleFilterAll,
        confirmExport: actions.confirmExport,
    });
}
