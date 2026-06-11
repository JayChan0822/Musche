import { defineShellState } from './shell-state-factory.js';

export const createUniversalModalsShellState = defineShellState('createUniversalModalsShellState', ({
    appInputModal,
    appConfirmModal,
}) => {
    return {
        values: {
            appInputModal,
            appConfirmModal,
        },
    };
});
