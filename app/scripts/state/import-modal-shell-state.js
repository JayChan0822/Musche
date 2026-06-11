export function createImportModalShellState({
    reactive,
    refs,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createImportModalShellState requires Vue reactive factory');
    }

    const {
        showImportModal,
    } = refs;

    return reactive({
        get showImportModal() { return showImportModal.value; },
        set showImportModal(value) { showImportModal.value = value; },
        triggerFileSelect: actions.triggerFileSelect,
    });
}
