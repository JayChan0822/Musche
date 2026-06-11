import { defineShellState } from './shell-state-factory.js';

export const createMidiCsvImportModalsShellState = defineShellState('createMidiCsvImportModalsShellState', ({
    appMidiManagerModal,
    appMidiImportModal,
    appCsvImportModal,
}) => {
    return {
        values: {
            appMidiManagerModal,
            appMidiImportModal,
            appCsvImportModal,
        },
    };
});
