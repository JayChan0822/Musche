import { defineShellState } from './shell-state-factory.js';

export const createQuickAddModalShellState = defineShellState('createQuickAddModalShellState', {
    reads: [
        'refs.quickAddType',
        'helpers.currentQuickAddGroups',
    ],
    models: [
        'refs.showQuickAddModal',
        'refs.showGroupSuggestions',
    ],
    values: [
        'refs.quickAddForm',
        'helpers.confirmQuickAdd',
    ],
});
