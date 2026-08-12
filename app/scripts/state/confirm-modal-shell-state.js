import { defineShellState } from './shell-state-factory.js';

export const createConfirmModalShellState = defineShellState('createConfirmModalShellState', {
    reads: [
        'refs.showConfirmModal',
    ],
    values: [
        'refs.confirmModalConfig',
        'helpers.closeConfirmModal',
        'helpers.handleConfirmAction',
    ],
});
