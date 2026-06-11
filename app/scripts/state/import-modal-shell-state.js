import { defineShellState } from './shell-state-factory.js';

export const createImportModalShellState = defineShellState('createImportModalShellState', ({
    refs,
    actions,
}) => {
    const {
        showImportModal,
    } = refs;
    return {
        models: {
            showImportModal,
        },
        values: {
            triggerFileSelect: actions.triggerFileSelect,
        },
    };
});
