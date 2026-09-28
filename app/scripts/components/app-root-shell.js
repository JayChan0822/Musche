import { appRootShellComponents } from './app-root-shell-components.js';
import { nextTick, onMounted, onUnmounted, ref } from 'vue';

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
    const libraryOverlay = ref(false);
    let media;
    const syncLayout = () => {
      libraryOverlay.value = !media.matches;
      libraryOpen.value = media.matches;
    };
    onMounted(() => {
      media = window.matchMedia('(min-width: 1200px)');
      syncLayout();
      media.addEventListener('change', syncLayout);
    });
    onUnmounted(() => media?.removeEventListener('change', syncLayout));
    const closeLibrary = async () => {
      libraryOpen.value = false;
      await nextTick();
      document.getElementById('library-toggle')?.focus({ preventScroll: true });
    };
    return { libraryOpen, libraryOverlay, closeLibrary };
  },
  template: `
    <div class="liquid-window flex-1 flex flex-col overflow-hidden relative">
        <app-header :ctx="ctx.appHeader" :library-open="libraryOpen" @toggle-library="libraryOpen = !libraryOpen"></app-header>

        <div class="flex-1 min-w-0 flex overflow-hidden relative">
            <app-sidebar :ctx="ctx.appSidebar"></app-sidebar>

            <app-main-content :ctx="ctx.appMainContent"></app-main-content>

            <app-resource-sidebar :ctx="ctx.appResourceLibrary" :open="libraryOpen" :overlay="libraryOverlay" @close="closeLibrary"></app-resource-sidebar>

            <app-mobile-controls :ctx="ctx.appMobileControls"></app-mobile-controls>
        </div>
    </div>
  `,
};
