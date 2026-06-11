import { defineShellState } from './shell-state-factory.js';

export const createAccountModalsShellState = defineShellState('createAccountModalsShellState', ({
    appAuthModal,
    appCropModal,
}) => {
    return {
        values: {
            appAuthModal,
            appCropModal,
        },
    };
});
