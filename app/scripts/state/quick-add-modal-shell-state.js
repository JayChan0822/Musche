export function createQuickAddModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createQuickAddModalShellState requires Vue reactive factory');
    }

    const {
        showQuickAddModal,
        quickAddType,
        showGroupSuggestions,
    } = refs;

    return reactive({
        get showQuickAddModal() { return showQuickAddModal.value; },
        set showQuickAddModal(value) { showQuickAddModal.value = value; },
        get quickAddType() { return quickAddType.value; },
        get quickAddForm() { return state.quickAddForm; },
        get showGroupSuggestions() { return showGroupSuggestions.value; },
        set showGroupSuggestions(value) { showGroupSuggestions.value = value; },
        get currentQuickAddGroups() { return state.currentQuickAddGroups.value; },
        confirmQuickAdd: actions.confirmQuickAdd,
    });
}
