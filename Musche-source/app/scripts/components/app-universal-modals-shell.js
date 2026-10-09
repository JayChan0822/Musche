import { appUniversalModalComponents } from './app-universal-modal-components.js';

export const AppUniversalModalsShell = {
  name: 'AppUniversalModalsShell',
  components: appUniversalModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-input-modal :ctx="ctx.appInputModal"></app-input-modal>
    <app-confirm-modal :ctx="ctx.appConfirmModal"></app-confirm-modal>
  `,
};
