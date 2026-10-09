import { defineShellState } from './shell-state-factory.js';

export const createInputModalShellState = defineShellState('createInputModalShellState', {
    reads: [
        'refs.showInputModal',
    ],
    models: [
        'refs.universalInputRef',
    ],
    values: [
        'refs.inputModalConfig',
        'helpers.closeInputModal',
        'helpers.confirmInputModal',
    ],
});
