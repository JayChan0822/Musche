import { defineShellState } from './shell-state-factory.js';

export const createUtilityModalsShellState = defineShellState('createUtilityModalsShellState', ({
    appQuickAddModal,
    appImportModal,
}) => {
    return {
        values: {
            appQuickAddModal,
            appImportModal,
        },
    };
});
