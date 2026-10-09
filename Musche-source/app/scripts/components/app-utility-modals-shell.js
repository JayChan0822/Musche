import { appUtilityModalComponents } from './app-utility-modal-components.js';

export const AppUtilityModalsShell = {
  name: 'AppUtilityModalsShell',
  components: appUtilityModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-quick-add-modal :ctx="ctx.appQuickAddModal"></app-quick-add-modal>
    <app-import-modal :ctx="ctx.appImportModal"></app-import-modal>
  `,
};
