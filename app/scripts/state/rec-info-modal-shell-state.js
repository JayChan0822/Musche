import { defineShellState } from './shell-state-factory.js';

export const createRecInfoModalShellState = defineShellState('createRecInfoModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showRecInfoModal,
        sidebarTab,
        activeRecDropdown,
        recDropdownSearch,
    } = refs;
    return {
        reads: {
            sidebarTab,
            filteredRecOptions: state.filteredRecOptions,
        },
        models: {
            showRecInfoModal,
            activeRecDropdown,
            recDropdownSearch,
        },
        raw: {
            recInfoForm: () => state.recInfoForm,
        },
        values: {
            selectRecOption: actions.selectRecOption,
            createRecOption: actions.createRecOption,
            saveRecInfo: actions.saveRecInfo,
        },
    };
});
