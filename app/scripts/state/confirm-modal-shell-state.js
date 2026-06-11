import { defineShellState } from './shell-state-factory.js';

export const createConfirmModalShellState = defineShellState('createConfirmModalShellState', ({
    refs,
    actions,
}) => {
    const {
        showConfirmModal,
        confirmModalConfig,
    } = refs;
    return {
        reads: {
            showConfirmModal,
        },
        values: {
            confirmModalConfig,
            closeConfirmModal: actions.closeConfirmModal,
            handleConfirmAction: actions.handleConfirmAction,
        },
    };
});
