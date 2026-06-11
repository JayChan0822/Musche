import { appStandaloneOverlayComponents } from './app-standalone-overlay-components.js';

export const AppStandaloneOverlaysShell = {
  name: 'AppStandaloneOverlaysShell',
  components: appStandaloneOverlayComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <app-settings-modal :ctx="ctx.appSettingsModal"></app-settings-modal>
    <app-track-list-modal :ctx="ctx.appTrackListModal"></app-track-list-modal>
    <app-mobile-task-input :ctx="ctx.appMobileTaskInput"></app-mobile-task-input>
  `,
};
