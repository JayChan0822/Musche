import { defineShellState } from './shell-state-factory.js';

export const createUtilityModalsShellState = defineShellState('createUtilityModalsShellState', {
    values: [
        'shells.appQuickAddModal',
        'shells.appImportModal',
    ],
});
