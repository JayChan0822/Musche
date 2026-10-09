import { appAccountModalComponents } from './app-account-modal-components.js';

export const AppAccountModalsShell = {
  name: 'AppAccountModalsShell',
  components: appAccountModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-auth-modal :ctx="ctx.appAuthModal"></app-auth-modal>
    <app-crop-modal :ctx="ctx.appCropModal"></app-crop-modal>
  `,
};
