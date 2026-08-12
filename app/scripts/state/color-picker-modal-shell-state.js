import { defineShellState } from './shell-state-factory.js';

export const createColorPickerModalShellState = defineShellState('createColorPickerModalShellState', {
    models: [
        'refs.showColorPickerModal',
        'helpers.tempColor',
    ],
    values: [
        'helpers.presetColors',
        'helpers.resetColorPicker',
        'helpers.saveColorPicker',
    ],
});
