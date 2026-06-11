export function createSplitModalShellState({
    reactive,
    refs,
    state,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createSplitModalShellState requires Vue reactive factory');
    }

    const {
        showSplitModal,
    } = refs;

    return reactive({
        get showSplitModal() { return showSplitModal.value; },
        set showSplitModal(value) { showSplitModal.value = value; },
        get splitState() { return state.splitState; },
        onSplitSliderInput: actions.onSplitSliderInput,
        confirmSplitSlider: actions.confirmSplitSlider,
    });
}
