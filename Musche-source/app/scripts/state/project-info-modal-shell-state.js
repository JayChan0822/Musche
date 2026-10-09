import { defineShellState } from './shell-state-factory.js';

export const createProjectInfoModalShellState = defineShellState('createProjectInfoModalShellState', {
    models: [
        'refs.showProjectInfoModal',
    ],
    values: [
        'refs.projectInfoForm',
        'helpers.metadataModalHandlers.saveProjectInfo',
    ],
});
