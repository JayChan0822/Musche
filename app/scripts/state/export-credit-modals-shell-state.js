export function createExportCreditModalsShellState({
    reactive,
    appExportModal,
    appCreditModal,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createExportCreditModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appExportModal,
        appCreditModal,
    });
}
