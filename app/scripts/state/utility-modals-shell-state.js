export function createUtilityModalsShellState({
    reactive,
    appQuickAddModal,
    appImportModal,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createUtilityModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appQuickAddModal,
        appImportModal,
    });
}
