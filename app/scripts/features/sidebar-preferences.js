import { ref, watch } from 'vue';

export function registerSidebarPreferencesFeature(context) {
  const { refs, services } = context;
  const { sidebarWidth } = refs;
  const { storageService } = services;

  const savedSidebarState = storageService.getItem('musche_sidebar_open');
  const isSidebarOpen = ref(savedSidebarState !== null ? JSON.parse(savedSidebarState) : true);

  watch([isSidebarOpen, sidebarWidth], ([open, width]) => {
    storageService.setItem('musche_sidebar_open', open);
    storageService.setItem('musche_sidebar_width', width);
  });

  return {
    isSidebarOpen,
  };
}
