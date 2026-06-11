export function createMetadataInfoModalsShellState({
    reactive,
    appProjectInfoModal,
    appRecInfoModal,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createMetadataInfoModalsShellState requires Vue reactive factory');
    }

    return reactive({
        appProjectInfoModal,
        appRecInfoModal,
    });
}
