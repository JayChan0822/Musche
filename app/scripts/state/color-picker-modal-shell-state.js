export function createColorPickerModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createColorPickerModalShellState requires Vue reactive factory');
    }

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

    return reactive({
        get showColorPickerModal() { return showColorPickerModal.value; },
        set showColorPickerModal(value) { showColorPickerModal.value = value; },
        get presetColors() { return presetColors; },
        get tempColor() { return tempColor.value; },
        set tempColor(value) { tempColor.value = value; },
        resetColorPicker,
        saveColorPicker,
    });
}
