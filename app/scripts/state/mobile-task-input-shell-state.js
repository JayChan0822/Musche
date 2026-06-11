import { defineShellState } from './shell-state-factory.js';

export const createMobileTaskInputShellState = defineShellState('createMobileTaskInputShellState', ({
    refs,
    state,
    computedState,
    actions,
}) => {
    const {
        showMobileTaskInput,
        activeDropdown,
        dropdownSearch,
        isMobile,
    } = refs;
    return {
        reads: {
            activeDropdown,
            filteredOptions: computedState.filteredOptions,
            isMobile,
        },
        models: {
            showMobileTaskInput,
            dropdownSearch,
        },
        raw: {
            newItem: () => state.newItem,
            dropdownExpandedGroups: () => state.dropdownExpandedGroups,
        },
        values: {
            getGroupColor: actions.getGroupColor,
            getNameById: actions.getNameById,
            getGroupedOptions: actions.getGroupedOptions,
            toggleDropdown: actions.toggleDropdown,
            toggleDropdownGroup: actions.toggleDropdownGroup,
            selectOption: actions.selectOption,
            openQuickAdd: actions.openQuickAdd,
            openDurationPicker: actions.openDurationPicker,
            addItemToPool: actions.addItemToPool,
        },
    };
});
