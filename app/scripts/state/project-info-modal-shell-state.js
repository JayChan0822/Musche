export function createProjectInfoModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createProjectInfoModalShellState requires Vue reactive factory');
    }

    const {
        showProjectInfoModal,
    } = refs;

    return reactive({
        get showProjectInfoModal() { return showProjectInfoModal.value; },
        set showProjectInfoModal(value) { showProjectInfoModal.value = value; },
        get projectInfoForm() { return state.projectInfoForm; },
        saveProjectInfo: actions.saveProjectInfo,
    });
}
