import { appExportCreditModalComponents } from './app-export-credit-modal-components.js';

export const AppExportCreditModalsShell = {
  name: 'AppExportCreditModalsShell',
  components: appExportCreditModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-export-modal :ctx="ctx.appExportModal"></app-export-modal>
    <app-credit-modal :ctx="ctx.appCreditModal"></app-credit-modal>
  `,
};
