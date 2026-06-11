import { defineShellState } from './shell-state-factory.js';

export const createDurationPickerModalShellState = defineShellState('createDurationPickerModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showDurationPicker,
        pickerMinRef,
        pickerSecRef,
    } = refs;
    const {
        pickerPos,
        tempDuration,
    } = state;
    const {
        closePicker,
        onScroll,
        onDragStart,
        resetDuration,
        confirmDurationPicker,
    } = actions;
    return {
        reads: {
            showDurationPicker,
        },
        models: {
            pickerMinRef,
            pickerSecRef,
        },
        values: {
            pickerPos,
            tempDuration,
            closePicker,
            onScroll,
            onDragStart,
            resetDuration,
            confirmDurationPicker,
        },
    };
});
