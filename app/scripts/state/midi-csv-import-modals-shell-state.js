export function createMidiCsvImportModalsShellState({
    reactive,
    appMidiManagerModal,
    appMidiImportModal,
    appCsvImportModal,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createMidiCsvImportModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appMidiManagerModal,
        appMidiImportModal,
        appCsvImportModal,
    });
}
