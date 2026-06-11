import { appRootShellComponents } from './app-root-shell-components.js';

export const AppRootShell = {
  name: 'AppRootShell',
  components: appRootShellComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  template: `
    <div class="liquid-window flex-1 flex flex-col overflow-hidden relative">
        <app-header :ctx="ctx.appHeader"></app-header>

        <div class="flex-1 flex overflow-hidden relative">
            <app-sidebar :ctx="ctx.appSidebar"></app-sidebar>

            <app-main-content :ctx="ctx.appMainContent"></app-main-content>

            <app-mobile-controls :ctx="ctx.appMobileControls"></app-mobile-controls>
        </div>
    </div>
  `,
};
