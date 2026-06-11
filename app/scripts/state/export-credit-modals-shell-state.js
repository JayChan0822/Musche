import { defineShellState } from './shell-state-factory.js';

export const createExportCreditModalsShellState = defineShellState('createExportCreditModalsShellState', ({
    appExportModal,
    appCreditModal,
}) => {
    return {
        values: {
            appExportModal,
            appCreditModal,
        },
    };
});
