import { defineShellState } from './shell-state-factory.js';

export const createAccountModalsShellState = defineShellState('createAccountModalsShellState', {
    values: [
        'shells.appAuthModal',
        'shells.appCropModal',
    ],
});
