import { defineShellState } from './shell-state-factory.js';

export const createProjectInfoModalShellState = defineShellState('createProjectInfoModalShellState', ({
    refs,
    state,
    actions,
}) => {
    const {
        showProjectInfoModal,
    } = refs;
    return {
        models: {
            showProjectInfoModal,
        },
        raw: {
            projectInfoForm: () => state.projectInfoForm,
        },
        values: {
            saveProjectInfo: actions.saveProjectInfo,
        },
    };
});
