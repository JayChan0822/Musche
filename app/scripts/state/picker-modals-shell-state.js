export function createPickerModalsShellState({
    reactive,
    appColorPickerModal,
    appDurationPicker,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createPickerModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appColorPickerModal,
        appDurationPicker,
    });
}
