export function createConfirmModalShellState({
    reactive,
    refs,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createConfirmModalShellState requires Vue reactive factory');
    }

    const {
        showConfirmModal,
        confirmModalConfig,
    } = refs;

    return reactive({
        get showConfirmModal() { return showConfirmModal.value; },
        get confirmModalConfig() { return confirmModalConfig; },
        closeConfirmModal: actions.closeConfirmModal,
        handleConfirmAction: actions.handleConfirmAction,
    });
}
