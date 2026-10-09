import { defineShellState } from './shell-state-factory.js';

export const createTaskActionModalsShellState = defineShellState('createTaskActionModalsShellState', {
    values: [
        'shells.appEditModal',
        'shells.appSplitModal',
    ],
});
