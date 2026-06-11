import { defineShellState } from './shell-state-factory.js';

export const createColorPickerModalShellState = defineShellState('createColorPickerModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showColorPickerModal,
        tempColor,
    } = refs;
    const {
        presetColors,
    } = state;
    const {
        resetColorPicker,
        saveColorPicker,
    } = actions;
    return {
        models: {
            showColorPickerModal,
            tempColor,
        },
        values: {
            presetColors,
            resetColorPicker,
            saveColorPicker,
        },
    };
});
