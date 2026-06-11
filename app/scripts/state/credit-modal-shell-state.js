import { defineShellState } from './shell-state-factory.js';

export const createCreditModalShellState = defineShellState('createCreditModalShellState', ({
    refs,
    midiRefs,
    actions,
}) => {
    const {
        showCreditModal,
        generatedCreditText,
        managingProject,
    } = refs;
    const {
        midiBpm,
        midiTimeSig,
    } = midiRefs;
    return {
        reads: {
            midiBpm,
            midiTimeSig,
            managingProject,
        },
        models: {
            showCreditModal,
            generatedCreditText,
        },
        values: {
            copyCreditText: actions.copyCreditText,
        },
    };
});
