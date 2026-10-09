import { defineShellState } from './shell-state-factory.js';

export const createSplitModalShellState = defineShellState('createSplitModalShellState', {
    models: [
        'refs.showSplitModal',
    ],
    values: [
        'helpers.splitState',
        'helpers.onSplitSliderInput',
        'helpers.confirmSplitSlider',
    ],
});
