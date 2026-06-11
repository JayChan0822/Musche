import { defineShellState } from './shell-state-factory.js';

export const createStandaloneOverlaysShellState = defineShellState('createStandaloneOverlaysShellState', ({
    appSettingsModal,
    appTrackListModal,
    appMobileTaskInput,
}) => {
    return {
        values: {
            appSettingsModal,
            appTrackListModal,
            appMobileTaskInput,
        },
    };
});
