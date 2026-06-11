export function createCropModalShellState({
    reactive,
    refs,
    actions,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createCropModalShellState requires Vue reactive factory');
    }

    const {
        showCropModal,
        cropImgSrc,
        cropImgRef,
        authLoading,
    } = refs;

    return reactive({
        get showCropModal() { return showCropModal.value; },
        get cropImgSrc() { return cropImgSrc.value; },
        get cropImgRef() { return cropImgRef.value; },
        set cropImgRef(value) { cropImgRef.value = value; },
        get authLoading() { return authLoading.value; },
        cancelCrop: actions.cancelCrop,
        confirmCrop: actions.confirmCrop,
    });
}
