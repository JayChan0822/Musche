import { defineShellState } from './shell-state-factory.js';

export const createMidiCsvImportModalsShellState = defineShellState('createMidiCsvImportModalsShellState', {
    values: [
        'shells.appMidiManagerModal',
        'shells.appMidiImportModal',
        'shells.appCsvImportModal',
    ],
});
