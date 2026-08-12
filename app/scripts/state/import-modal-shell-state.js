import { defineShellState } from './shell-state-factory.js';

export const createImportModalShellState = defineShellState('createImportModalShellState', {
    models: [
        'refs.showImportModal',
    ],
    values: [
        'helpers.dataIoHandlers.triggerFileSelect',
    ],
});
