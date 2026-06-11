export function createCreditModalShellState({
    reactive,
    refs,
    midiRefs,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createCreditModalShellState requires Vue reactive factory');
    }

    const {
        showCreditModal,
        generatedCreditText,
        managingProject,
    } = refs;
    const {
        midiBpm,
        midiTimeSig,
    } = midiRefs;

    return reactive({
        get showCreditModal() { return showCreditModal.value; },
        set showCreditModal(value) { showCreditModal.value = value; },
        get generatedCreditText() { return generatedCreditText.value; },
        set generatedCreditText(value) { generatedCreditText.value = value; },
        get midiBpm() { return midiBpm.value; },
        get midiTimeSig() { return midiTimeSig.value; },
        get managingProject() { return managingProject.value; },
        copyCreditText: actions.copyCreditText,
    });
}
