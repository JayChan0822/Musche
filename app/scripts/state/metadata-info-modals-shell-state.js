import { defineShellState } from './shell-state-factory.js';

export const createMetadataInfoModalsShellState = defineShellState('createMetadataInfoModalsShellState', ({
    appProjectInfoModal,
    appRecInfoModal,
}) => {
    return {
        values: {
            appProjectInfoModal,
            appRecInfoModal,
        },
    };
});
