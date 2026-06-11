import { appMidiCsvImportModalComponents } from './app-midi-csv-import-modal-components.js';

export const AppMidiCsvImportModalsShell = {
  name: 'AppMidiCsvImportModalsShell',
  components: appMidiCsvImportModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-midi-manager-modal :ctx="ctx.appMidiManagerModal"></app-midi-manager-modal>
    <app-midi-import-modal :ctx="ctx.appMidiImportModal"></app-midi-import-modal>
    <app-csv-import-modal :ctx="ctx.appCsvImportModal"></app-csv-import-modal>
  `,
};
