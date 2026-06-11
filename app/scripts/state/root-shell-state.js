export function createRootShellState({
    reactive,
    appHeader,
    appSidebar,
    appMainContent,
    appMobileControls,
    appStandaloneOverlaysShell,
    appTaskActionModalsShell,
    appAccountModalsShell,
    appUtilityModalsShell,
    appUniversalModalsShell,
    appPickerModalsShell,
    appExportCreditModalsShell,
    appMidiCsvImportModalsShell,
    appMetadataInfoModalsShell,
}) {
    if (typeof reactive !== 'function') {
        throw new TypeError('createRootShellState requires Vue reactive factory');
    }

    const appRootShell = reactive({
        appHeader,
        appSidebar,
        appMainContent,
        appMobileControls,
    });

    const appRootOverlaysShell = reactive({
        appStandaloneOverlaysShell,
        appTaskActionModalsShell,
        appAccountModalsShell,
        appUtilityModalsShell,
        appUniversalModalsShell,
        appPickerModalsShell,
        appExportCreditModalsShell,
        appMidiCsvImportModalsShell,
        appMetadataInfoModalsShell,
    });

    return {
        appRootShell,
        appRootOverlaysShell,
    };
}
