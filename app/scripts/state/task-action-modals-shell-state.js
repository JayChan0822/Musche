export function createTaskActionModalsShellState({
    reactive,
    appEditModal,
    appSplitModal,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createTaskActionModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appEditModal,
        appSplitModal,
    });
}
