import { defineShellState } from './shell-state-factory.js';

export const createMetadataInfoModalsShellState = defineShellState('createMetadataInfoModalsShellState', {
    values: [
        'shells.appProjectInfoModal',
        'shells.appRecInfoModal',
    ],
});
