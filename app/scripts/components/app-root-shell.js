import { appRootShellComponents } from './app-root-shell-components.js';
import { nextTick, ref } from 'vue';

export const AppRootShell = {
  name: 'AppRootShell',
  components: appRootShellComponents,
  props: {
    ctx: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const libraryOpen = ref(false);
    const closeLibrary = async () => {
      libraryOpen.value = false;
      await nextTick();
      document.getElementById('library-toggle')?.focus({ preventScroll: true });
    };
    return { libraryOpen, closeLibrary };
  },
  template: `
    <div class="liquid-window flex-1 flex flex-col overflow-hidden relative">
        <app-header :ctx="ctx.appHeader" :library-open="libraryOpen" @toggle-library="libraryOpen = !libraryOpen"></app-header>

        <div class="flex-1 min-w-0 flex overflow-hidden relative">
            <app-sidebar :ctx="ctx.appSidebar"></app-sidebar>

            <app-main-content :ctx="ctx.appMainContent"></app-main-content>

            <app-resource-sidebar :ctx="ctx.appResourceLibrary" :open="libraryOpen" @close="closeLibrary"></app-resource-sidebar>

            <app-mobile-controls :ctx="ctx.appMobileControls"></app-mobile-controls>
        </div>
    </div>
  `,
};
