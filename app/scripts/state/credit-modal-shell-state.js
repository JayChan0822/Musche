import { defineShellState } from './shell-state-factory.js';

export const createCreditModalShellState = defineShellState('createCreditModalShellState', {
    reads: [
        'refs.midiBpm',
        'refs.midiTimeSig',
        'refs.managingProject',
    ],
    models: [
        'refs.showCreditModal',
        'refs.generatedCreditText',
    ],
    values: [
        'helpers.metadataModalHandlers.copyCreditText',
    ],
});
