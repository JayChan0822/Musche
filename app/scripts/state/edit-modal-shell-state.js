export function createEditModalShellState({
    reactive,
    refs,
    state,
    computed,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createEditModalShellState requires Vue reactive factory');
    }

    const {
        showEditor,
        editingItem,
        editingSource,
        activeDropdown,
        dropdownSearch,
        isMobile,
    } = refs;
    const {
        dropdownExpandedGroups,
        percState,
    } = state;
    const {
        filteredOptions,
        showOrchestrationField,
        parsedRoster,
        activeOrchPresets,
        isPercussionMode,
        timeSlots,
    } = computed;
    const {
        triggerTouchHaptic,
        toggleDropdown,
        getNameById,
        getGroupedOptions,
        toggleDropdownGroup,
        selectOption,
        openDurationPicker,
        getRosterName,
        updateRosterName,
        scanPercussionTags,
        addPercPlayer,
        removePercPlayer,
        togglePercTagSelect,
        assignTagsToPlayer,
        updatePercOrchestration,
        deleteEditingItem,
        saveEdit,
        pushHistory,
    } = actions;

    return reactive({
        get showEditor() { return showEditor.value; },
        set showEditor(value) { showEditor.value = value; },
        get editingItem() { return editingItem.value; },
        get editingSource() { return editingSource.value; },
        get activeDropdown() { return activeDropdown.value; },
        get dropdownSearch() { return dropdownSearch.value; },
        set dropdownSearch(value) { dropdownSearch.value = value; },
        get dropdownExpandedGroups() { return dropdownExpandedGroups; },
        get filteredOptions() { return filteredOptions.value; },
        get isMobile() { return isMobile.value; },
        get showOrchestrationField() { return showOrchestrationField.value; },
        get parsedRoster() { return parsedRoster.value; },
        get activeOrchPresets() { return activeOrchPresets.value; },
        get isPercussionMode() { return isPercussionMode.value; },
        get percState() { return percState; },
        get timeSlots() { return timeSlots.value; },
        triggerTouchHaptic,
        toggleDropdown,
        getNameById,
        getGroupedOptions,
        toggleDropdownGroup,
        selectOption,
        openDurationPicker,
        getRosterName,
        updateRosterName,
        scanPercussionTags,
        addPercPlayer,
        removePercPlayer,
        togglePercTagSelect,
        assignTagsToPlayer,
        updatePercOrchestration,
        deleteEditingItem,
        saveEdit,
        pushHistory,
    });
}
