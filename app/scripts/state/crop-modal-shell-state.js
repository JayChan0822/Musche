import { defineShellState } from './shell-state-factory.js';

export const createCropModalShellState = defineShellState('createCropModalShellState', {
    reads: [
        'refs.showCropModal',
        'refs.cropImgSrc',
        'refs.authLoading',
    ],
    models: [
        'refs.cropImgRef',
    ],
    values: [
        'helpers.cancelCrop',
        'helpers.confirmCrop',
    ],
});
