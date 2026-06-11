export function createInputModalShellState({
    reactive,
    refs,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createInputModalShellState requires Vue reactive factory');
    }

    const {
        showInputModal,
        inputModalConfig,
        universalInputRef,
    } = refs;

    return reactive({
        get showInputModal() { return showInputModal.value; },
        get inputModalConfig() { return inputModalConfig; },
        get universalInputRef() { return universalInputRef.value; },
        set universalInputRef(value) { universalInputRef.value = value; },
        closeInputModal: actions.closeInputModal,
        confirmInputModal: actions.confirmInputModal,
    });
}
