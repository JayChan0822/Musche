import { defineShellState } from './shell-state-factory.js';

export const createPickerModalsShellState = defineShellState('createPickerModalsShellState', ({
    appColorPickerModal,
    appDurationPicker,
}) => {
    return {
        values: {
            appColorPickerModal,
            appDurationPicker,
        },
    };
});
