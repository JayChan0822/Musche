export function createUniversalModalsShellState({
    reactive,
    appInputModal,
    appConfirmModal,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createUniversalModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appInputModal,
        appConfirmModal,
    });
}
