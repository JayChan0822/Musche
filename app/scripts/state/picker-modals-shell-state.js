import { defineShellState } from './shell-state-factory.js';

export const createPickerModalsShellState = defineShellState('createPickerModalsShellState', {
    values: [
        'shells.appColorPickerModal',
        'shells.appDurationPicker',
    ],
});
