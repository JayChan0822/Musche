import { defineShellState } from './shell-state-factory.js';

export const createUniversalModalsShellState = defineShellState('createUniversalModalsShellState', {
    values: [
        'shells.appInputModal',
        'shells.appConfirmModal',
    ],
});
