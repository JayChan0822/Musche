export function createStandaloneOverlaysShellState({
    reactive,
    appSettingsModal,
    appTrackListModal,
    appMobileTaskInput,
} = {}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createStandaloneOverlaysShellState requires Vue reactive factory');
    }

    return reactive({
        appSettingsModal,
        appTrackListModal,
        appMobileTaskInput,
    });
}
