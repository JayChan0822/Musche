export function createAccountModalsShellState({
    reactive,
    appAuthModal,
    appCropModal,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createAccountModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appAuthModal,
        appCropModal,
    });
}
