import { appRootOverlayShellComponents } from './app-root-overlay-shell-components.js';

export const AppRootOverlaysShell = {
  name: 'AppRootOverlaysShell',
  components: appRootOverlayShellComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-standalone-overlays-shell :ctx="ctx.appStandaloneOverlaysShell"></app-standalone-overlays-shell>
    <app-task-action-modals-shell :ctx="ctx.appTaskActionModalsShell"></app-task-action-modals-shell>
    <app-account-modals-shell :ctx="ctx.appAccountModalsShell"></app-account-modals-shell>
    <app-utility-modals-shell :ctx="ctx.appUtilityModalsShell"></app-utility-modals-shell>
    <app-universal-modals-shell :ctx="ctx.appUniversalModalsShell"></app-universal-modals-shell>
    <app-picker-modals-shell :ctx="ctx.appPickerModalsShell"></app-picker-modals-shell>
    <app-export-credit-modals-shell :ctx="ctx.appExportCreditModalsShell"></app-export-credit-modals-shell>
    <app-midi-csv-import-modals-shell :ctx="ctx.appMidiCsvImportModalsShell"></app-midi-csv-import-modals-shell>
    <app-metadata-info-modals-shell :ctx="ctx.appMetadataInfoModalsShell"></app-metadata-info-modals-shell>
  `,
};
