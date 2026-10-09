import { defineShellState } from './shell-state-factory.js';

export const createExportCreditModalsShellState = defineShellState('createExportCreditModalsShellState', {
    values: [
        'shells.appExportModal',
        'shells.appCreditModal',
    ],
});
