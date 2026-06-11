import { defineShellState } from './shell-state-factory.js';

export const createQuickAddModalShellState = defineShellState('createQuickAddModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showQuickAddModal,
        quickAddType,
        showGroupSuggestions,
    } = refs;
    return {
        reads: {
            quickAddType,
            currentQuickAddGroups: state.currentQuickAddGroups,
        },
        models: {
            showQuickAddModal,
            showGroupSuggestions,
        },
        raw: {
            quickAddForm: () => state.quickAddForm,
        },
        values: {
            confirmQuickAdd: actions.confirmQuickAdd,
        },
    };
});
