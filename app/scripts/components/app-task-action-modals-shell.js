import { appTaskActionModalComponents } from './app-task-action-modal-components.js';

export const AppTaskActionModalsShell = {
  name: 'AppTaskActionModalsShell',
  components: appTaskActionModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-edit-modal :ctx="ctx.appEditModal"></app-edit-modal>
    <app-split-modal :ctx="ctx.appSplitModal"></app-split-modal>
  `,
};
