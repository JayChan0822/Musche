import { defineShellState } from './shell-state-factory.js';

export const createTaskActionModalsShellState = defineShellState('createTaskActionModalsShellState', ({
    appEditModal,
    appSplitModal,
}) => {
    return {
        values: {
            appEditModal,
            appSplitModal,
        },
    };
});
