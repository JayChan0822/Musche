import { defineShellState } from './shell-state-factory.js';

export const createEditModalShellState = defineShellState('createEditModalShellState', ({
    refs,
    state,
    computed,
    actions,
}) => {
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
    return {
        reads: {
            editingItem,
            editingSource,
            activeDropdown,
            filteredOptions,
            isMobile,
            showOrchestrationField,
            parsedRoster,
            activeOrchPresets,
            isPercussionMode,
            timeSlots,
        },
        models: {
            showEditor,
            dropdownSearch,
        },
        values: {
            dropdownExpandedGroups,
            percState,
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
        },
    };
});
