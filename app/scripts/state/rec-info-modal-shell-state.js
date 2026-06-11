export function createRecInfoModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createRecInfoModalShellState requires Vue reactive factory');
    }

    const {
        showRecInfoModal,
        sidebarTab,
        activeRecDropdown,
        recDropdownSearch,
    } = refs;

    return reactive({
        get showRecInfoModal() { return showRecInfoModal.value; },
        set showRecInfoModal(value) { showRecInfoModal.value = value; },
        get sidebarTab() { return sidebarTab.value; },
        get recInfoForm() { return state.recInfoForm; },
        get activeRecDropdown() { return activeRecDropdown.value; },
        set activeRecDropdown(value) { activeRecDropdown.value = value; },
        get recDropdownSearch() { return recDropdownSearch.value; },
        set recDropdownSearch(value) { recDropdownSearch.value = value; },
        get filteredRecOptions() { return state.filteredRecOptions.value; },
        selectRecOption: actions.selectRecOption,
        createRecOption: actions.createRecOption,
        saveRecInfo: actions.saveRecInfo,
    });
}
