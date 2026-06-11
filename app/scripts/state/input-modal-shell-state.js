import { defineShellState } from './shell-state-factory.js';

export const createInputModalShellState = defineShellState('createInputModalShellState', ({
    refs,
    actions,
}) => {
    const {
        showInputModal,
        inputModalConfig,
        universalInputRef,
    } = refs;
    return {
        reads: {
            showInputModal,
        },
        models: {
            universalInputRef,
        },
        values: {
            inputModalConfig,
            closeInputModal: actions.closeInputModal,
            confirmInputModal: actions.confirmInputModal,
        },
    };
});
