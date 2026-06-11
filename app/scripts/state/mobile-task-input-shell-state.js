export function createMobileTaskInputShellState({
    reactive,
    refs,
    state,
    computedState,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createMobileTaskInputShellState requires Vue reactive factory');
    }

    const {
        showMobileTaskInput,
        activeDropdown,
        dropdownSearch,
        isMobile,
    } = refs;

    return reactive({
        get showMobileTaskInput() { return showMobileTaskInput.value; },
        set showMobileTaskInput(value) { showMobileTaskInput.value = value; },
        get newItem() { return state.newItem; },
        get activeDropdown() { return activeDropdown.value; },
        get dropdownSearch() { return dropdownSearch.value; },
        set dropdownSearch(value) { dropdownSearch.value = value; },
        get dropdownExpandedGroups() { return state.dropdownExpandedGroups; },
        get filteredOptions() { return computedState.filteredOptions.value; },
        get isMobile() { return isMobile.value; },
        getGroupColor: actions.getGroupColor,
        getNameById: actions.getNameById,
        getGroupedOptions: actions.getGroupedOptions,
        toggleDropdown: actions.toggleDropdown,
        toggleDropdownGroup: actions.toggleDropdownGroup,
        selectOption: actions.selectOption,
        openQuickAdd: actions.openQuickAdd,
        openDurationPicker: actions.openDurationPicker,
        addItemToPool: actions.addItemToPool,
    });
}
