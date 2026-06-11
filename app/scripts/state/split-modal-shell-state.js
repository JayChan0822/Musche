import { defineShellState } from './shell-state-factory.js';

export const createSplitModalShellState = defineShellState('createSplitModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showSplitModal,
    } = refs;
    return {
        models: {
            showSplitModal,
        },
        raw: {
            splitState: () => state.splitState,
        },
        values: {
            onSplitSliderInput: actions.onSplitSliderInput,
            confirmSplitSlider: actions.confirmSplitSlider,
        },
    };
});
