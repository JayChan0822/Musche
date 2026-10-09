import { defineShellState } from './shell-state-factory.js';

export const createDurationPickerModalShellState = defineShellState('createDurationPickerModalShellState', {
    reads: [
        'refs.showDurationPicker',
    ],
    models: [
        'refs.pickerMinRef',
        'refs.pickerSecRef',
    ],
    values: [
        'refs.pickerPos',
        'refs.tempDuration',
        'helpers.closePicker',
        'helpers.onScroll',
        'helpers.onDragStart',
        'helpers.resetDuration',
        'helpers.confirmDurationPicker',
    ],
});
