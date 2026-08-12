import { defineShellState } from './shell-state-factory.js';

export const createStandaloneOverlaysShellState = defineShellState('createStandaloneOverlaysShellState', {
    values: [
        'shells.appSettingsModal',
        'shells.appTrackListModal',
        'shells.appMobileTaskInput',
    ],
});
