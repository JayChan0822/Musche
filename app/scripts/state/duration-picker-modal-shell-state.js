export function createDurationPickerModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createDurationPickerModalShellState requires Vue reactive factory');
    }

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

    return reactive({
        get showDurationPicker() { return showDurationPicker.value; },
        get pickerPos() { return pickerPos; },
        get pickerMinRef() { return pickerMinRef.value; },
        set pickerMinRef(value) { pickerMinRef.value = value; },
        get pickerSecRef() { return pickerSecRef.value; },
        set pickerSecRef(value) { pickerSecRef.value = value; },
        get tempDuration() { return tempDuration; },
        closePicker,
        onScroll,
        onDragStart,
        resetDuration,
        confirmDurationPicker,
    });
}
