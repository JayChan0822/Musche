import { appMetadataInfoModalComponents } from './app-metadata-info-modal-components.js';

export const AppMetadataInfoModalsShell = {
  name: 'AppMetadataInfoModalsShell',
  components: appMetadataInfoModalComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-project-info-modal :ctx="ctx.appProjectInfoModal"></app-project-info-modal>
    <app-rec-info-modal :ctx="ctx.appRecInfoModal"></app-rec-info-modal>
  `,
};
