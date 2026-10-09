import { defineShellState } from './shell-state-factory.js';

export const createMobileTaskInputShellState = defineShellState('createMobileTaskInputShellState', {
    reads: [
        'refs.activeDropdown',
        'helpers.filteredOptions',
        'refs.isMobile',
    ],
    models: [
        'refs.showMobileTaskInput',
        'helpers.dropdownSearch',
    ],
    values: [
        'refs.newItem',
        'helpers.dropdownExpandedGroups',
        'helpers.getGroupColor',
        'helpers.getNameById',
        'helpers.getGroupedOptions',
        'helpers.toggleDropdown',
        'helpers.toggleDropdownGroup',
        'helpers.selectOption',
        'helpers.openQuickAdd',
        'helpers.openDurationPicker',
        'helpers.addItemToPool',
    ],
});
