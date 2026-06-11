import { defineShellState } from './shell-state-factory.js';

export const createCropModalShellState = defineShellState('createCropModalShellState', ({
    refs,
    actions,
}) => {
    const {
        showCropModal,
        cropImgSrc,
        cropImgRef,
        authLoading,
    } = refs;
    return {
        reads: {
            showCropModal,
            cropImgSrc,
            authLoading,
        },
        models: {
            cropImgRef,
        },
        values: {
            cancelCrop: actions.cancelCrop,
            confirmCrop: actions.confirmCrop,
        },
    };
});
